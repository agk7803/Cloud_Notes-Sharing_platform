const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Cloud Notes API",
    version: "1.0.0",
    description: "API documentation for Cloud Notes – Sharing Platform",
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 5050}`,
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "Firebase ID Token",
      },
    },
  },
  tags: [
    { name: "Notes", description: "Note CRUD operations" },
    { name: "Groups", description: "Group management & chat" },
    { name: "Upload", description: "File uploads (audio, profile pic)" },
    { name: "Users", description: "User profile management" },
    { name: "AI", description: "AI / Gemini academic chat" },
    { name: "Assessments", description: "Assessment CRUD & submission" },
    { name: "Events", description: "Event management" },
  ],
  paths: {
    /* ======================== NOTES ======================== */
    "/api/notes/public": {
      get: {
        tags: ["Notes"],
        summary: "Get all public notes",
        responses: { 200: { description: "List of public notes" } },
      },
    },
    "/api/notes/count": {
      get: {
        tags: ["Notes"],
        summary: "Get total note count",
        responses: { 200: { description: "Note count" } },
      },
    },
    "/api/notes/subjects": {
      get: {
        tags: ["Notes"],
        summary: "Get list of note subjects",
        responses: { 200: { description: "List of subjects" } },
      },
    },
    "/api/notes": {
      get: {
        tags: ["Notes"],
        summary: "Get current user's notes",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "List of user notes" } },
      },
      post: {
        tags: ["Notes"],
        summary: "Upload a new note",
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Note created" } },
      },
    },
    "/api/notes/{id}": {
      delete: {
        tags: ["Notes"],
        summary: "Delete a note by ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Note deleted" } },
      },
    },

    /* ======================== GROUPS ======================== */
    "/api/groups": {
      get: {
        tags: ["Groups"],
        summary: "Get all groups",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "List of groups" } },
      },
      post: {
        tags: ["Groups"],
        summary: "Create a new group",
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: "Group created" } },
      },
    },
    "/api/groups/{id}": {
      get: {
        tags: ["Groups"],
        summary: "Get a group by ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Group details" } },
      },
    },
    "/api/groups/{id}/leave": {
      post: {
        tags: ["Groups"],
        summary: "Leave a group",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Left group" } },
      },
    },
    "/api/groups/{id}/members": {
      get: {
        tags: ["Groups"],
        summary: "Get group members",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "List of members" } },
      },
    },
    "/api/groups/{id}/chats": {
      get: {
        tags: ["Groups"],
        summary: "Get group chat messages",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Chat messages" } },
      },
    },

    /* ======================== UPLOAD ======================== */
    "/api/upload/audio": {
      post: {
        tags: ["Upload"],
        summary: "Upload an audio file",
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  audio: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Audio uploaded" } },
      },
    },
    "/api/upload/profile-pic": {
      post: {
        tags: ["Upload"],
        summary: "Upload a profile picture",
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  image: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Profile picture uploaded" } },
      },
    },

    /* ======================== USERS ======================== */
    "/api/users/test": {
      get: {
        tags: ["Users"],
        summary: "Test user routes",
        responses: { 200: { description: "Routes working" } },
      },
    },
    "/api/users/count": {
      get: {
        tags: ["Users"],
        summary: "Get total user count",
        responses: { 200: { description: "User count" } },
      },
    },
    "/api/users/me": {
      get: {
        tags: ["Users"],
        summary: "Get current user profile",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "User profile" } },
      },
    },
    "/api/users/update-profile": {
      put: {
        tags: ["Users"],
        summary: "Update user profile",
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string" },
                  profilePicture: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Profile updated" } },
      },
    },

    /* ======================== AI ======================== */
    "/api/academic-chat": {
      post: {
        tags: ["AI"],
        summary: "Send a message to Gemini AI academic chat",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["message"],
                properties: {
                  message: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "AI reply" } },
      },
    },

    /* ======================== ASSESSMENTS ======================== */
    "/api/assessments/answerkey/{id}": {
      get: {
        tags: ["Assessments"],
        summary: "Get answer key PDF",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Answer key PDF" } },
      },
    },
    "/api/assessments/questionpaper/{id}": {
      get: {
        tags: ["Assessments"],
        summary: "Get question paper PDF",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Question paper PDF" } },
      },
    },
    "/api/assessments/generate": {
      post: {
        tags: ["Assessments"],
        summary: "Generate a new assessment from uploaded file",
        security: [{ BearerAuth: [] }],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Assessment generated" } },
      },
    },
    "/api/assessments": {
      get: {
        tags: ["Assessments"],
        summary: "Get all assessments",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "List of assessments" } },
      },
    },
    "/api/assessments/{id}": {
      get: {
        tags: ["Assessments"],
        summary: "Get a single assessment by ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Assessment details" } },
      },
      delete: {
        tags: ["Assessments"],
        summary: "Delete an assessment",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Assessment deleted" } },
      },
    },
    "/api/assessments/{id}/submit": {
      post: {
        tags: ["Assessments"],
        summary: "Submit answers for an assessment",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  answers: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        questionIdx: { type: "integer" },
                        selectedOption: { type: "integer" },
                        answerText: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Assessment submitted" } },
      },
    },
    "/api/assessments/results/user": {
      get: {
        tags: ["Assessments"],
        summary: "Get current user's assessment results",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "List of results" } },
      },
    },
    "/api/assessments/results/{resultId}": {
      get: {
        tags: ["Assessments"],
        summary: "Get specific result with details",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "resultId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Result details" } },
      },
    },

    /* ======================== EVENTS ======================== */
    "/api/events": {
      get: {
        tags: ["Events"],
        summary: "Get all events",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "List of events" } },
      },
      post: {
        tags: ["Events"],
        summary: "Create a new event",
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: "Event created" } },
      },
    },
    "/api/events/{id}": {
      delete: {
        tags: ["Events"],
        summary: "Delete an event",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Event deleted" } },
      },
    },
  },
};

const swaggerSpec = swaggerJsdoc({ definition: swaggerDefinition, apis: [] });

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Cloud Notes API Docs",
  }));
}

module.exports = setupSwagger;
