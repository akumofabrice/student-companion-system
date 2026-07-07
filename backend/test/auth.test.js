const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const authController = require('../src/controllers/authController');

function createRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

test('forgotPassword and resetPassword work for an existing user', async () => {
  const username = `recover-${Date.now()}`;
  const email = `${username}@example.com`;
  const passwordHash = await bcrypt.hash('oldpassword', 10);

  const user = await User.create({ username, email, password: passwordHash });

  const req = { body: { username } };
  const res = createRes();
  await authController.forgotPassword(req, res);

  assert.equal(res.statusCode, 200);
  assert.match(res.body.message, /Recovery code generated/);

  const updatedUser = await User.findById(user._id);
  assert.ok(updatedUser.passwordResetCode);

  const resetRes = createRes();
  await authController.resetPassword({ body: { username, resetCode: updatedUser.passwordResetCode, newPassword: 'newpassword' } }, resetRes);

  assert.equal(resetRes.statusCode, 200);
  const finalUser = await User.findById(user._id);
  const isMatch = await bcrypt.compare('newpassword', finalUser.password);
  assert.equal(isMatch, true);
  assert.equal(finalUser.passwordResetCode, '');
  await User.findByIdAndDelete(user._id);
});
