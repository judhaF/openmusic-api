const ClientError = require('../../exceptions/ClientError');
const { UserPayloadSchema } = require('./schema');

const UsersValidator = {
  validateUserPayload: (payload) => {
    const validationResult = UserPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new ClientError(validationResult.error.message);
    }
  },
};

module.exports = UsersValidator;
