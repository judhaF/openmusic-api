const Joi = require('joi');

const PostCollaborationPayloadSchema = Joi.object({
  userId: Joi.string().required(),
  playlistId: Joi.string().required(),
});

const DeleteCollaborationPayloadSchema = Joi.object({
  userId: Joi.string().required(),
  playlistId: Joi.string().required(),
});

module.exports = {
  PostCollaborationPayloadSchema,
  DeleteCollaborationPayloadSchema,
};
