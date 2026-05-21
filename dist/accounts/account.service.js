"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const sequelize_1 = require("sequelize");
const config_json_1 = __importDefault(require("../config.json"));
const secret = process.env.JWT_SECRET || config_json_1.default.secret;
const db_1 = __importDefault(require("../_helpers/db"));
const role_1 = require("../_helpers/role");
const send_email_1 = require("../_helpers/send-email");
exports.accountService = {
    authenticate,
    refreshToken,
    revokeToken,
    register,
    verifyEmail,
    forgotPassword,
    validateResetToken,
    resetPassword,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};
// ─── Auth ──────────────────────────────────────────────
async function authenticate({ email, password, ipAddress }) {
    const account = await db_1.default.Account.scope('withHash').findOne({ where: { email } });
    if (!account || !account.isVerified || !bcryptjs_1.default.compareSync(password, account.passwordHash)) {
        throw 'Email or password is incorrect';
    }
    const jwtToken = generateJwtToken(account);
    const refreshTokenObj = await generateRefreshToken(account, ipAddress);
    await refreshTokenObj.save();
    return { ...basicDetails(account), jwtToken, refreshToken: refreshTokenObj.token };
}
async function refreshToken({ token, ipAddress }) {
    const refreshTokenObj = await getRefreshToken(token);
    const account = await refreshTokenObj.getAccount();
    // Rotate refresh token
    const newRefreshToken = await generateRefreshToken(account, ipAddress);
    refreshTokenObj.revoked = new Date();
    refreshTokenObj.revokedByIp = ipAddress;
    refreshTokenObj.replacedByToken = newRefreshToken.token;
    await refreshTokenObj.save();
    await newRefreshToken.save();
    const jwtToken = generateJwtToken(account);
    return { ...basicDetails(account), jwtToken, refreshToken: newRefreshToken.token };
}
async function revokeToken({ token, ipAddress }) {
    const refreshTokenObj = await getRefreshToken(token);
    refreshTokenObj.revoked = new Date();
    refreshTokenObj.revokedByIp = ipAddress;
    await refreshTokenObj.save();
}
// ─── Registration ──────────────────────────────────────
async function register(params, origin) {
    // First account gets Admin role
    const isFirstAccount = (await db_1.default.Account.count()) === 0;
    params.role = isFirstAccount ? role_1.Role.Admin : role_1.Role.User;
    params.verificationToken = randomTokenString();
    params.passwordHash = await hash(params.password);
    params.created = new Date();
    await db_1.default.Account.create(params);
    await sendVerificationEmail(params, origin);
}
async function verifyEmail({ token }) {
    const account = await db_1.default.Account.findOne({ where: { verificationToken: token } });
    if (!account)
        throw 'Verification failed';
    account.verified = new Date();
    account.verificationToken = null;
    await account.save();
}
// ─── Password Reset ────────────────────────────────────
async function forgotPassword({ email }, origin) {
    const account = await db_1.default.Account.findOne({ where: { email } });
    // Return silently even if email not found to prevent enumeration
    if (!account)
        return;
    account.resetToken = randomTokenString();
    account.resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await account.save();
    await sendPasswordResetEmail(account, origin);
}
async function validateResetToken({ token }) {
    const account = await db_1.default.Account.findOne({
        where: {
            resetToken: token,
            resetTokenExpires: { [sequelize_1.Op.gt]: new Date() }
        }
    });
    if (!account)
        throw 'Invalid token';
    return account;
}
async function resetPassword({ token, password }) {
    const account = await validateResetToken({ token });
    account.passwordHash = await hash(password);
    account.passwordReset = new Date();
    account.resetToken = null;
    account.resetTokenExpires = null;
    await account.save();
}
// ─── CRUD ──────────────────────────────────────────────
async function getAll() {
    const accounts = await db_1.default.Account.findAll();
    return accounts.map(basicDetails);
}
async function getById(id) {
    const account = await getAccount(id);
    return basicDetails(account);
}
async function create(params) {
    if (await db_1.default.Account.findOne({ where: { email: params.email } })) {
        throw `Email "${params.email}" is already registered`;
    }
    params.passwordHash = await hash(params.password);
    params.verified = new Date();
    params.created = new Date();
    const account = await db_1.default.Account.create(params);
    return basicDetails(account);
}
async function update(id, params) {
    const account = await getAccount(id);
    if (params.email && account.email !== params.email &&
        await db_1.default.Account.findOne({ where: { email: params.email } })) {
        throw `Email "${params.email}" is already registered`;
    }
    if (params.password) {
        params.passwordHash = await hash(params.password);
    }
    Object.assign(account, params);
    account.updated = new Date();
    await account.save();
    return basicDetails(account);
}
async function _delete(id) {
    const account = await getAccount(id);
    await account.destroy();
}
// ─── Helpers ───────────────────────────────────────────
async function getAccount(id) {
    const account = await db_1.default.Account.findByPk(id);
    if (!account)
        throw 'Account not found';
    return account;
}
async function getRefreshToken(token) {
    const refreshToken = await db_1.default.RefreshToken.findOne({ where: { token } });
    if (!refreshToken || !refreshToken.isActive)
        throw 'Invalid token';
    return refreshToken;
}
async function hash(password) {
    return bcryptjs_1.default.hash(password, 10);
}
function generateJwtToken(account) {
    return jsonwebtoken_1.default.sign({ id: account.id }, config_json_1.default.secret, { expiresIn: '15m' });
}
async function generateRefreshToken(account, ipAddress) {
    return db_1.default.RefreshToken.build({
        accountId: account.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdByIp: ipAddress
    });
}
function randomTokenString() {
    return crypto_1.default.randomBytes(40).toString('hex');
}
function basicDetails(account) {
    const { id, title, firstName, lastName, email, role, created, updated, isVerified } = account;
    return { id, title, firstName, lastName, email, role, created, updated, isVerified };
}
async function sendVerificationEmail(account, origin) {
    const verifyUrl = `${origin}/#/account/verify-email?token=${account.verificationToken}`; // ✅ Fixed: /accounts/ → /account/
    await (0, send_email_1.sendEmail)({
        to: account.email,
        subject: 'Sign-up Verification - Verify Email',
        html: `
      <h4>Verify Email</h4>
      <p>Thanks for registering!</p>
      <p>Please click the below link to verify your email address:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
    `
    });
}
async function sendPasswordResetEmail(account, origin) {
    const resetUrl = `${origin}/#/account/reset-password?token=${account.resetToken}`; // ✅ Fixed: /accounts/ → /account/
    await (0, send_email_1.sendEmail)({
        to: account.email,
        subject: 'Sign-up Verification - Reset Password',
        html: `
      <h4>Reset Password Email</h4>
      <p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
    `
    });
}
