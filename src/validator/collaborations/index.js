const ClientError = require('../../exceptions/ClientError');
const {
  PostCollaborationPayloadSchema,
  DeleteCollaborationPayloadSchema,
} = require('./schema');

const CollaborationValidator = {
  validatePostCollaborationPayload: (payload) => {
    const validationResult = PostCollaborationPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new ClientError(validationResult.error.message);
    }
  },
  validateDeleteCollaborationPayload: (payload) => {
    const validationResult = DeleteCollaborationPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new ClientError(validationResult.error.message);
    }
  },
};

module.exports = CollaborationValidator;
