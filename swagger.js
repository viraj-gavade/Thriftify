/**
 * @fileoverview Swagger documentation configuration for Thriftify API
 * Defines OpenAPI specifications for all endpoint documentation
 */

const swaggerJsdoc = require('swagger-jsdoc');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Thriftify API',
    version: '1.0.0',
    description: 'API documentation for Thriftify marketplace application',
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
    contact: {
      name: 'Thriftify Support',
      url: 'https://thriftify.com/support',
      email: 'support@thriftify.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://thriftify.onrender.com/',
      description: 'Production server',
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication operations',
    },
    {
      name: 'Products',
      description: 'Product listing operations',
    },
    {
      name: 'Orders',
      description: 'Order management endpoints',
    },
    {
      name: 'Bookmarks',
      description: 'User bookmark operations',
    },
    {
      name: 'Support',
      description: 'Customer support operations',
    },
    {
      name: 'Categories',
      description: 'Category browsing operations',
    },
    {
      name: 'User Profile',
      description: 'User profile management operations',
    },
  ],
  components: {
    schemas: {
      User: {
        type: 'object',
        required: ['username', 'email', 'fullname', 'password'],
        properties: {
          username: {
            type: 'string',
            description: 'Unique username for the user',
            example: 'johndoe',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'john@example.com',
          },
          fullname: {
            type: 'string',
            description: 'User full name',
            example: 'John Doe',
          },
          password: {
            type: 'string',
            format: 'password',
            description: 'User password',
            example: 'Password123!',
          },
          profilepic: {
            type: 'string',
            format: 'uri',
            description: 'URL to user profile picture',
            example: 'https://cloudinary.com/thriftify/profile/abc123.jpg',
          },
        },
      },
      Product: {
        type: 'object',
        required: ['title', 'description', 'price', 'category', 'location'],
        properties: {
          title: {
            type: 'string',
            description: 'Product title',
            example: 'Vintage Leather Jacket',
          },
          description: {
            type: 'string',
            description: 'Detailed product description',
            example: 'Genuine leather jacket in excellent condition. Size M, color brown.',
          },
          price: {
            type: 'number',
            description: 'Product price',
            example: 75.99,
          },
          category: {
            type: 'string',
            enum: ['electronics', 'furniture', 'clothing', 'books', 'others'],
            description: 'Product category',
            example: 'clothing',
          },
          location: {
            type: 'string',
            description: 'Location where the product is available',
            example: 'New York, NY',
          },
          images: {
            type: 'array',
            items: {
              type: 'string',
              format: 'uri',
              example: 'https://cloudinary.com/thriftify/products/jacket1.jpg',
            },
            description: 'Array of image URLs for the product',
          },
        },
      },
      Order: {
        type: 'object',
        properties: {
          listing: {
            type: 'string',
            description: 'ID of purchased listing',
            example: '60d21b4667d0d8992e610c85',
          },
          shippingInfo: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                example: 'John Doe',
              },
              address: {
                type: 'string',
                example: '123 Main St',
              },
              phone: {
                type: 'string',
                example: '555-123-4567',
              },
              city: {
                type: 'string',
                example: 'New York',
              },
              pincode: {
                type: 'string',
                example: '10001',
              },
            },
          },
          paymentMethod: {
            type: 'string',
            enum: ['paypal', 'razorpay'],
            example: 'paypal',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'fail',
          },
          message: {
            type: 'string',
            example: 'An error occurred',
          },
        },
      },
      Bookmark: {
        type: 'object',
        properties: {
          user: {
            type: 'string',
            description: 'User ID who bookmarked the listing',
            example: '60d21b4667d0d8992e610c85'
          },
          listing: {
            type: 'string',
            description: 'ID of bookmarked listing',
            example: '60d21b4667d0d8992e610c87'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-06-24T12:00:00Z'
          }
        }
      },
      Category: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            enum: ['electronics', 'furniture', 'clothing', 'books', 'others'],
            example: 'electronics'
          },
          description: {
            type: 'string',
            example: 'Electronic devices and gadgets'
          }
        }
      },
      SupportRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: 'John Doe'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com'
          },
          subject: {
            type: 'string',
            enum: ['account', 'payment', 'listing', 'order', 'other'],
            example: 'payment'
          },
          message: {
            type: 'string',
            example: 'I am having an issue with my payment'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-06-24T12:00:00Z'
          }
        }
      }
    },
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
      },
    },
  },
  paths: {
    '/api/v1/user/signup': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        description: 'Creates a new user account with profile information',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  username: {
                    type: 'string',
                    example: 'johndoe',
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'john@example.com',
                  },
                  fullname: {
                    type: 'string',
                    example: 'John Doe',
                  },
                  password: {
                    type: 'string',
                    format: 'password',
                    example: 'Password123!',
                  },
                  confirmPassword: {
                    type: 'string',
                    format: 'password',
                    example: 'Password123!',
                  },
                  profilepic: {
                    type: 'string',
                    format: 'binary',
                    description: 'Profile picture file',
                  },
                },
                required: ['username', 'email', 'fullname', 'password', 'confirmPassword'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully, redirected to login page',
          },
          400: {
            description: 'Bad request - validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          409: {
            description: 'Username or email already taken',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/user/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login to account',
        description: 'Authenticates user credentials and provides access tokens via cookies',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'john@example.com',
                  },
                  password: {
                    type: 'string',
                    format: 'password',
                    example: 'Password123!',
                  },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful, redirected to home page with auth cookies',
          },
          401: {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/user/logout': {
      get: {
        tags: ['Authentication'],
        summary: 'Log out the current user',
        description: 'Clears authentication cookies and logs out the user',
        responses: {
          200: {
            description: 'User logged out successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Logged out successfully'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/user/profile': {
      get: {
        tags: ['User Profile'],
        summary: 'Get current user profile',
        description: 'Retrieves the profile of the currently authenticated user',
        security: [
          {
            cookieAuth: []
          }
        ],
        responses: {
          200: {
            description: 'User profile retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/user/profile/{id}': {
      get: {
        tags: ['User Profile'],
        summary: 'Get user profile by ID',
        description: 'Retrieves a user profile by their ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'User ID to retrieve',
            schema: {
              type: 'string',
              example: '60d21b4667d0d8992e610c85'
            }
          }
        ],
        responses: {
          200: {
            description: 'User profile retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/user/update-details': {
      patch: {
        tags: ['User Profile'],
        summary: 'Update user details',
        description: 'Updates the authenticated user\'s profile details',
        security: [
          {
            cookieAuth: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullname: {
                    type: 'string',
                    example: 'John Smith'
                  },
                  username: {
                    type: 'string',
                    example: 'johnsmith'
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'john@example.com'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'User details updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          },
          400: {
            description: 'Bad request - validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/user/update-password': {
      patch: {
        tags: ['User Profile'],
        summary: 'Update user password',
        description: 'Changes the authenticated user\'s password',
        security: [
          {
            cookieAuth: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  currentPassword: {
                    type: 'string',
                    format: 'password',
                    example: 'OldPassword123'
                  },
                  newPassword: {
                    type: 'string',
                    format: 'password',
                    example: 'NewPassword123'
                  },
                  confirmPassword: {
                    type: 'string',
                    format: 'password',
                    example: 'NewPassword123'
                  }
                },
                required: ['currentPassword', 'newPassword', 'confirmPassword']
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Password updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Password updated successfully'
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Bad request - passwords do not match or invalid current password',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/user/update-profilepic': {
      patch: {
        tags: ['User Profile'],
        summary: 'Update profile picture',
        description: 'Updates the authenticated user\'s profile picture',
        security: [
          {
            cookieAuth: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  profilepic: {
                    type: 'string',
                    format: 'binary',
                    description: 'Profile picture file'
                  }
                },
                required: ['profilepic']
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Profile picture updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Profile picture updated successfully'
                    },
                    user: {
                      $ref: '#/components/schemas/User'
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Bad request - invalid image format',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/user/bookmarks': {
      get: {
        tags: ['Bookmarks'],
        summary: 'Get user bookmarks',
        description: 'Retrieves a list of the authenticated user\'s bookmarked listings',
        security: [
          {
            cookieAuth: []
          }
        ],
        responses: {
          200: {
            description: 'Bookmarks retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      listingId: {
                        type: 'string',
                        example: '60d21b4667d0d8992e610c85'
                      },
                      title: {
                        type: 'string',
                        example: 'Vintage Leather Jacket'
                      }
                    }
                  }
                }
              }
            }
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/user/my-orders': {
      get: {
        tags: ['Orders'],
        summary: 'Get user orders',
        description: 'Retrieves all orders placed by the authenticated user',
        security: [
          {
            cookieAuth: []
          }
        ],
        responses: {
          200: {
            description: 'User orders retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Order'
                  }
                }
              }
            }
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/user/check-auth': {
      get: {
        tags: ['Authentication'],
        summary: 'Check authentication status',
        description: 'Verifies if the user is currently authenticated',
        security: [
          {
            cookieAuth: []
          }
        ],
        responses: {
          200: {
            description: 'User is authenticated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      $ref: '#/components/schemas/User'
                    }
                  }
                }
              }
            }
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/listings': {
      get: {
        tags: ['Products'],
        summary: 'Get all product listings',
        description: 'Retrieves a paginated list of product listings with optional filters',
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Page number for pagination',
            schema: {
              type: 'integer',
              default: 1,
            },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Number of items per page',
            schema: {
              type: 'integer',
              default: 10,
            },
          },
          {
            name: 'sortBy',
            in: 'query',
            description: 'Field to sort by',
            schema: {
              type: 'string',
              enum: ['createdAt', 'price'],
              default: 'createdAt',
            },
          },
          {
            name: 'sortOrder',
            in: 'query',
            description: 'Sort direction',
            schema: {
              type: 'string',
              enum: ['asc', 'desc'],
              default: 'desc',
            },
          },
          {
            name: 'category',
            in: 'query',
            description: 'Filter by category',
            schema: {
              type: 'string',
              enum: ['electronics', 'furniture', 'clothing', 'books', 'others'],
            },
          },
          {
            name: 'location',
            in: 'query',
            description: 'Filter by location',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'List of products',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    count: {
                      type: 'integer',
                      example: 10,
                    },
                    total: {
                      type: 'integer',
                      example: 50,
                    },
                    totalPages: {
                      type: 'integer',
                      example: 5,
                    },
                    currentPage: {
                      type: 'integer',
                      example: 1,
                    },
                    listings: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Product',
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'No listings found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'No listings found',
                    },
                  },
                },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Create new product listing',
        description: 'Add a new product listing to the marketplace',
        security: [
          {
            cookieAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string',
                    example: 'Vintage Leather Jacket',
                  },
                  description: {
                    type: 'string',
                    example: 'Genuine leather jacket in excellent condition. Size M, color brown.',
                  },
                  price: {
                    type: 'number',
                    example: 75.99,
                  },
                  category: {
                    type: 'string',
                    enum: ['electronics', 'furniture', 'clothing', 'books', 'others'],
                    example: 'clothing',
                  },
                  location: {
                    type: 'string',
                    example: 'New York, NY',
                  },
                  images: {
                    type: 'array',
                    items: {
                      type: 'string',
                      format: 'binary',
                    },
                    description: 'Product images (up to 5)',
                  },
                },
                required: ['title', 'description', 'price', 'category', 'location', 'images'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Listing created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Product',
                },
              },
            },
          },
          400: {
            description: 'Bad request - validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/listings/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product details by ID',
        description: 'Retrieve detailed information about a specific product listing',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the product listing',
            schema: {
              type: 'string',
              example: '60d21b4667d0d8992e610c85',
            },
          },
        ],
        responses: {
          200: {
            description: 'Product details retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Product',
                },
              },
            },
          },
          404: {
            description: 'Listing not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Listing not found',
                    },
                  },
                },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Products'],
        summary: 'Update product details',
        description: 'Update information for an existing product listing',
        security: [
          {
            cookieAuth: [],
          },
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the product listing',
            schema: {
              type: 'string',
              example: '60d21b4667d0d8992e610c85',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string',
                    example: 'Updated Leather Jacket',
                  },
                  description: {
                    type: 'string',
                    example: 'Updated description with more details.',
                  },
                  price: {
                    type: 'number',
                    example: 85.99,
                  },
                  category: {
                    type: 'string',
                    enum: ['electronics', 'furniture', 'clothing', 'books', 'others'],
                    example: 'clothing',
                  },
                  location: {
                    type: 'string',
                    example: 'Los Angeles, CA',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Listing updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Product',
                },
              },
            },
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Forbidden - user not authorized to update this listing',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          404: {
            description: 'Listing not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete product listing',
        description: 'Remove a product listing from the marketplace',
        security: [
          {
            cookieAuth: [],
          },
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the product listing',
            schema: {
              type: 'string',
              example: '60d21b4667d0d8992e610c85',
            },
          },
        ],
        responses: {
          200: {
            description: 'Listing deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Listing deleted successfully',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Cannot delete a sold listing',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Forbidden - user not authorized to delete this listing',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          404: {
            description: 'Listing not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/listings/add-listing': {
      get: {
        tags: ['Products'],
        summary: 'Render add listing form',
        description: 'Renders the form to add a new product listing',
        security: [
          {
            cookieAuth: []
          }
        ],
        responses: {
          200: {
            description: 'Add listing form page rendered successfully'
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/listings/sorted': {
      get: {
        tags: ['Products'],
        summary: 'Get sorted listings',
        description: 'Retrieves product listings with sorting options',
        parameters: [
          {
            name: 'sort',
            in: 'query',
            description: 'Field to sort by',
            schema: {
              type: 'string',
              enum: ['price', 'createdAt'],
              default: 'createdAt'
            }
          },
          {
            name: 'order',
            in: 'query',
            description: 'Sort direction',
            schema: {
              type: 'string',
              enum: ['asc', 'desc'],
              default: 'desc'
            }
          }
        ],
        responses: {
          200: {
            description: 'Sorted listings retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    listings: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Product'
                      }
                    }
                  }
                }
              }
            }
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/listings/search': {
      get: {
        tags: ['Products'],
        summary: 'Search listings',
        description: 'Search product listings by keyword and optional category',
        parameters: [
          {
            name: 'query',
            in: 'query',
            required: true,
            description: 'Search keyword',
            schema: {
              type: 'string',
              example: 'jacket'
            }
          },
          {
            name: 'category',
            in: 'query',
            description: 'Optional category filter',
            schema: {
              type: 'string',
              enum: ['all', 'electronics', 'furniture', 'clothing', 'books', 'others'],
              default: 'all'
            }
          }
        ],
        responses: {
          200: {
            description: 'Search results retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    count: {
                      type: 'integer',
                      example: 5
                    },
                    listings: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Product'
                      }
                    }
                  }
                }
              }
            }
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/listings/user/listings': {
      get: {
        tags: ['Products'],
        summary: 'Get user listings',
        description: 'Retrieve all listings created by the authenticated user',
        security: [
          {
            cookieAuth: []
          }
        ],
        responses: {
          200: {
            description: 'User listings retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Product'
                  }
                }
              }
            }
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/listings/user/listings/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get user listing by ID',
        description: 'Retrieve a specific listing created by the authenticated user',
        security: [
          {
            cookieAuth: []
          }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the listing to retrieve',
            schema: {
              type: 'string',
              example: '60d21b4667d0d8992e610c85'
            }
          }
        ],
        responses: {
          200: {
            description: 'User listing retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Product'
                }
              }
            }
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          404: {
            description: 'Listing not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/listings/user/bookmarks': {
      get: {
        tags: ['Bookmarks'],
        summary: 'Get user bookmarks',
        description: 'Retrieve all bookmarked listings for the authenticated user',
        security: [
          {
            cookieAuth: []
          }
        ],
        responses: {
          200: {
            description: 'User bookmarks retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Product'
                  }
                }
              }
            }
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Bookmarks'],
        summary: 'Add to bookmarks',
        description: 'Add a listing to the authenticated user\'s bookmarks',
        security: [
          {
            cookieAuth: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  listingId: {
                    type: 'string',
                    example: '60d21b4667d0d8992e610c85'
                  }
                },
                required: ['listingId']
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Listing bookmarked successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Added to bookmarks'
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Already bookmarked',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          404: {
            description: 'Listing not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Bookmarks'],
        summary: 'Remove from bookmarks',
        description: 'Remove a listing from the authenticated user\'s bookmarks',
        security: [
          {
            cookieAuth: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  listingId: {
                    type: 'string',
                    example: '60d21b4667d0d8992e610c85'
                  }
                },
                required: ['listingId']
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Bookmark removed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Removed from bookmarks'
                    }
                  }
                }
              }
            }
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          404: {
            description: 'Listing not found or not bookmarked',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/listings/bookmarks/toggle': {
      post: {
        tags: ['Bookmarks'],
        summary: 'Toggle bookmark status',
        description: 'Toggle bookmark status for a listing (add if not bookmarked, remove if bookmarked)',
        security: [
          {
            cookieAuth: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  listingId: {
                    type: 'string',
                    example: '60d21b4667d0d8992e610c85'
                  }
                },
                required: ['listingId']
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Bookmark status toggled successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['added', 'removed'],
                      example: 'added'
                    },
                    message: {
                      type: 'string',
                      example: 'Added to bookmarks'
                    }
                  }
                }
              }
            }
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          404: {
            description: 'Listing not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/bookmarks/toggle/{listingId}': {
      post: {
        tags: ['Bookmarks'],
        summary: 'Toggle bookmark status',
        description: 'Toggle bookmark status for a listing (add/remove)',
        security: [
          {
            cookieAuth: []
          }
        ],
        parameters: [
          {
            name: 'listingId',
            in: 'path',
            required: true,
            description: 'ID of the listing to toggle bookmark for',
            schema: {
              type: 'string',
              example: '60d21b4667d0d8992e610c85'
            }
          }
        ],
        responses: {
          200: {
            description: 'Bookmark status toggled successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['added', 'removed'],
                      example: 'added'
                    },
                    message: {
                      type: 'string',
                      example: 'Added to bookmarks'
                    }
                  }
                }
              }
            }
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          404: {
            description: 'Listing not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/bookmarks': {
      get: {
        tags: ['Bookmarks'],
        summary: 'Get all bookmarks',
        description: 'Get all bookmarked listings for the authenticated user',
        security: [
          {
            cookieAuth: []
          }
        ],
        responses: {
          200: {
            description: 'Bookmarks retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Product'
                  }
                }
              }
            }
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/orders/create': {
      post: {
        tags: ['Orders'],
        summary: 'Create new order',
        description: 'Create a new order for a product listing',
        security: [
          {
            cookieAuth: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Order'
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Order created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Order'
                }
              }
            }
          },
          400: {
            description: 'Bad request - validation error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get order by ID',
        description: 'Retrieve details of a specific order',
        security: [
          {
            cookieAuth: []
          }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Order ID to retrieve',
            schema: {
              type: 'string',
              example: '60d21b4667d0d8992e610c85'
            }
          }
        ],
        responses: {
          200: {
            description: 'Order retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Order'
                }
              }
            }
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          404: {
            description: 'Order not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/orders': {
      get: {
        tags: ['Orders'],
        summary: 'Get all user orders',
        description: 'Retrieve all orders for the authenticated user',
        security: [
          {
            cookieAuth: []
          }
        ],
        responses: {
          200: {
            description: 'Orders retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Order'
                  }
                }
              }
            }
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/orders/delete/{orderId}': {
      delete: {
        tags: ['Orders'],
        summary: 'Delete user order',
        description: 'Delete a specific order for the authenticated user',
        security: [
          {
            cookieAuth: []
          }
        ],
        parameters: [
          {
            name: 'orderId',
            in: 'path',
            required: true,
            description: 'Order ID to delete',
            schema: {
              type: 'string',
              example: '60d21b4667d0d8992e610c85'
            }
          }
        ],
        responses: {
          200: {
            description: 'Order deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Order deleted successfully'
                    }
                  }
                }
              }
            }
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          404: {
            description: 'Order not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/orders/payment/capture': {
      get: {
        tags: ['Orders'],
        summary: 'Capture payment',
        description: 'Captures payment for an order from payment service callback',
        parameters: [
          {
            name: 'paymentId',
            in: 'query',
            description: 'Payment ID from payment service',
            schema: {
              type: 'string',
              example: 'pay_123456789'
            }
          },
          {
            name: 'orderId',
            in: 'query',
            description: 'Order ID from payment service',
            schema: {
              type: 'string',
              example: 'order_123456789'
            }
          }
        ],
        responses: {
          200: {
            description: 'Payment captured successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    order: {
                      $ref: '#/components/schemas/Order'
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Payment capture failed',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/orders/view/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'View order details',
        description: 'View detailed information about an order',
        security: [
          {
            cookieAuth: []
          }
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Order ID to view',
            schema: {
              type: 'string',
              example: '60d21b4667d0d8992e610c85'
            }
          }
        ],
        responses: {
          200: {
            description: 'Order details page rendered successfully'
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          404: {
            description: 'Order not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/category': {
      get: {
        tags: ['Categories'],
        summary: 'Default category route',
        description: 'Redirects to the "others" category page',
        security: [
          {
            cookieAuth: []
          }
        ],
        responses: {
          302: {
            description: 'Redirect to others category'
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/category/{category}': {
      get: {
        tags: ['Categories'],
        summary: 'Get listings by category',
        description: 'Retrieve listings filtered by category with optional price filtering and sorting',
        security: [
          {
            cookieAuth: []
          }
        ],
        parameters: [
          {
            name: 'category',
            in: 'path',
            required: true,
            description: 'Category name to filter by',
            schema: {
              type: 'string',
              enum: ['electronics', 'furniture', 'clothing', 'books', 'others']
            }
          },
          {
            name: 'sort',
            in: 'query',
            description: 'Sorting method',
            schema: {
              type: 'string',
              enum: ['price-low', 'price-high'],
              default: 'newest'
            }
          },
          {
            name: 'min',
            in: 'query',
            description: 'Minimum price filter',
            schema: {
              type: 'number'
            }
          },
          {
            name: 'max',
            in: 'query',
            description: 'Maximum price filter',
            schema: {
              type: 'number'
            }
          }
        ],
        responses: {
          200: {
            description: 'Category page rendered successfully'
          },
          302: {
            description: 'Redirected to valid category'
          },
          401: {
            description: 'Unauthorized - user not logged in',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/support': {
      get: {
        tags: ['Support'],
        summary: 'Render support page',
        description: 'Renders the customer support page',
        responses: {
          200: {
            description: 'Support page rendered successfully'
          }
        }
      }
    },
    '/api/v1/support/submit': {
      post: {
        tags: ['Support'],
        summary: 'Submit a support request',
        description: 'Send a support inquiry to the Thriftify team',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    example: 'John Doe',
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'john@example.com',
                  },
                  subject: {
                    type: 'string',
                    enum: ['account', 'payment', 'listing', 'order', 'other'],
                    example: 'payment',
                  },
                  message: {
                    type: 'string',
                    example: 'I am having an issue with my recent payment. The transaction was completed but my order still shows as pending.',
                  },
                },
                required: ['name', 'email', 'subject', 'message'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Support request submitted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'success',
                    },
                    message: {
                      type: 'string',
                      example: 'Your support request has been submitted. We will contact you shortly.',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Bad request - missing required fields',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
  },
};

// Options for the swagger docs
const options = {
  // Import swaggerDefinitions
  swaggerDefinition,
  // Path to the API docs
  apis: ['./Routes/*.js', './Controllers/*.js'],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
