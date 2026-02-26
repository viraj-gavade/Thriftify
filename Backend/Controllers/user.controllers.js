/**
 * @fileoverview Controller functions for user management including registration, 
 * authentication, profile updates, and account management.
 */

// Cloudinary utility for file uploading and management (used in registration and profile updates)
const uploadFile = require('../utils/cloudinary')
// User database model with schema definition and authentication methods
const User = require('../Schemas/user.schemas') 
// Password hashing library (used indirectly via User model methods)
const bcryptjs = require('bcrypt') 
// JSON Web Token library for authentication (used in token generation functions)
const jwt = require('jsonwebtoken') 
// Custom utility for handling asynchronous Express routes with proper error handling
const asyncHandler = require('../utils/asynchandler') 
// Custom error class for consistent API error responses
const CustomApiError = require('../utils/apiErrors') 
// Custom response formatter for consistent API responses
const ApiResponse = require('../utils/apiResponse') 

/**
 * Generates both access and refresh tokens for a user
 * 
 * @param {string} userId - MongoDB ObjectId of the user
 * @returns {Object} Object containing accessToken and refreshToken
 * @throws {CustomApiError} If token generation fails
 */
const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        // Fetch user from database using userId
        const user = await User.findById(userId)

        // Generate Access and Refresh tokens using methods defined in the User model
        const accessToken = await user.createAccestoken()
        const refreshToken = await user.createRefreshtoken()

        // Store the generated refresh token in the user's record
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        // Return both tokens for client-side usage
        return { accessToken, refreshToken }
    } catch (error) {
        throw new CustomApiError(500, 'Something went wrong while generating the access and refresh token!')
    }
}

/**
 * Registers a new user with required profile information and avatar
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Redirects to login page on successful registration
 * @throws {CustomApiError} For validation errors or registration failures
 */
const registerUser = asyncHandler(async (req, res) => {
    // Destructure request body to get the user input
    const { username, email, fullname, password, confirmPassword } = req.body

    // Check for empty fields and throw a custom error if any field is missing
    if ([username, email, fullname, password, confirmPassword].some((field) =>
        field?.trim() === ''
    )) {
        throw new CustomApiError(400, 'All fields must be filled!')
    }

    // Check if a user with the same username or email already exists in the database
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existingUser) {
        return res.status(409).json({
            status: 'fail',
            message: 'Username or email already taken!'
        })  
    }

    // Check if the profile picture file was uploaded
    const profilepicLocalpath = req.files?.profilepic?.[0]?.path
    
    if (!profilepicLocalpath) {
        throw new CustomApiError(400, 'Profile picture must be uploaded!')
    }

    // Upload avatar to Cloudinary
    const profilepic = await uploadFile(profilepicLocalpath)
    
    // Validate if avatar upload was successful
    if (!profilepic) {
        throw new CustomApiError(400, 'Avatar file is required')
    }

    // Validate password match
    if (password !== confirmPassword) {
        throw new CustomApiError(400, 'Passwords do not match')
    }

    // Create new user record in the database
    const user = await User.create({
        profilepic: profilepic.url,
        fullname,
        email,
        username: username.toLowerCase(),
        password: confirmPassword
    })

    // Fetch the created user without sensitive fields like password and refreshToken
    const createdUser = await User.findById(user._id).select(
        '-password -refreshToken'
    )

    // Throw an error if user creation fails
    if (!createdUser) {
        throw new CustomApiError(500, 'Server was unable to create the user please try again later!')
    }

    // Return JSON response for SPA frontend
    return res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        user: createdUser
    })
})

/**
 * Authenticates a user and generates access and refresh tokens
 * 
 * @param {Object} req - Express request object with email and password
 * @param {Object} res - Express response object
 * @returns {Object} Redirects to homepage on successful login with set auth cookies
 * @throws {CustomApiError} For authentication failures
 */
const loginUser = asyncHandler(async (req, res) => {
    // Destructure request body to get identifier and password
    const { email, password } = req.body
   
    // Find user by email
    const user = await User.findOne({
        email: email.toLowerCase()
    })
    
    // Return JSON response if user is not found
    if (!user) {
        return res.status(404).json({
            status: 'fail',
            message: 'User not found!'
        });
    }

    // Check if the provided password matches the stored password
    const validPassword = await user.isPasswordCorrect(password)
    if (!validPassword) {
        return res.status(401).json({
            status: 'fail',
            message: 'Invalid user credentials!'
        });
    }

    // Generate access and refresh tokens for the logged-in user
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)

    // Fetch the logged-in user without sensitive fields
    const loggedInUser = await User.findById(user._id).select('-password -refreshToken')

    // Cookie options for secure and HTTP-only cookies
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
      };

    // Send the generated tokens in cookies and JSON response
    return res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json({
            success: true,
            message: 'Login successful!',
            user: loggedInUser
        });
})

/**
 * Logs out a user by clearing their refresh token and auth cookies
 * 
 * @param {Object} req - Express request object with authenticated user
 * @param {Object} res - Express response object
 * @returns {Object} Redirects to homepage after clearing auth cookies
 * @throws {CustomApiError} For logout failures
 */
const logoutUser = asyncHandler(async (req, res) => {
    try {
        // Clear the refresh token in the database if the user is logged in
        if (req.user?._id) {
            await User.findByIdAndUpdate(
                req.user._id,
                {
                    $set: { refreshToken: null }
                },
                { new: true }
            );
        }
        
        // Set cookie options - must match the options used when setting cookies
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            path: '/',
        };
        
        // Clear cookies and return JSON response
        return res.status(200)
            .clearCookie('accessToken', options)
            .clearCookie('refreshToken', options)
            .json({
                success: true,
                message: 'Logged out successfully'
            });
    } catch (error) {
        throw new CustomApiError(500, 'Something went wrong during logout');
    }
});

/**
 * Retrieves a user by their ID
 * 
 * @param {Object} req - Express request object with user ID in params
 * @param {Object} res - Express response object
 * @returns {Object} User object without sensitive fields
 * @throws {CustomApiError} If user is not found
 */
const getUser = asyncHandler(async (req, res) => {
    // Fetch the user ID from the request parameters
    const { id } = req.params
    
    // Fetch the user by ID from the database
    const user = await User.findById(id).select('-password -refreshToken')
    
    // Throw an error if user is not found
    if (!user) {
        throw new CustomApiError(404, 'User not found!')
    }
    
    // Return the user details in the response
    return res.status(200).json(user)
})

/**
 * Updates user profile details (name, username, email)
 * 
 * @param {Object} req - Express request object with authenticated user
 * @param {Object} res - Express response object
 * @returns {Object} Updated user object and status message
 * @throws {CustomApiError} For validation failures or update errors
 */
const UpdateDetails = asyncHandler(async (req, res) => {
    if(!req.user){
        throw new CustomApiError(401, 'Unauthorized access!')
    }
    
    const { id } = req.user
    const currentUser = await User.findById(id).select('-password -refreshToken')
    
    if (!currentUser) {
        throw new CustomApiError(404, 'User not found!')
    }
    
    // Extract fields from request body
    const { fullname, username, email } = req.body
    
    // Create an object to store fields that need to be updated
    const updateFields = {}
    
    // Check and validate each field individually
    if (fullname) {
        updateFields.fullname = fullname
    }
    
    if (username) {
        // Check if username is already taken
        const checkUsername = await User.findOne({ username, _id: { $ne: id } })
        if (checkUsername) {
            throw new CustomApiError(409, 'Username already taken!')
        }
        updateFields.username = username
    }
    
    if (email) {
        // Check if email is already taken
        const checkEmail = await User.findOne({ email, _id: { $ne: id } })
        if (checkEmail) {
            throw new CustomApiError(409, 'Email already taken!')
        }
        updateFields.email = email
    }
    
    // Check if there are any fields to update
    if (Object.keys(updateFields).length === 0) {
        return res.status(200).json({
            status: 'success',
            message: 'No fields provided for update',
            user: currentUser
        })
    }
    
    // Update user details in the database with only the provided fields
    const updatedUser = await User.findByIdAndUpdate(
        id, 
        updateFields, 
        { new: true, runValidators: true }
    ).select('-password -refreshToken')
    
    // Throw an error if user update fails
    if (!updatedUser) {
        throw new CustomApiError(500, 'Server was unable to update the user please try again later!')
    }
    
    // Return the updated user details in the response
    return res.status(200).json({
        status: 'success',
        message: 'User updated successfully',
        updatedFields: Object.keys(updateFields),
        user: updatedUser
    })
})

/**
 * Updates user profile picture
 * 
 * @param {Object} req - Express request object with authenticated user and file upload
 * @param {Object} res - Express response object
 * @returns {Object} Updated user object with new profile picture URL
 * @throws {CustomApiError} For validation failures or update errors
 */
const UpdateProfilePic = asyncHandler(async (req, res) => {
    if(!req.user){
        throw new CustomApiError(401, 'Unauthorized access!')
    }
    
    const { id } = req.user
    const currentUser = await User.findById(id).select('-password -refreshToken')
    
    if (!currentUser) {
        throw new CustomApiError(404, 'User not found!')
    }
    
    // Check if the profile picture file was uploaded
    const profilepicLocalpath = req.files?.profilepic?.[0]?.path
    
    if (!profilepicLocalpath) {
        throw new CustomApiError(400, 'Profile picture must be uploaded!')
    }
    
    // Upload avatar to Cloudinary
    const profilepic = await uploadFile(profilepicLocalpath)
    
    // Validate if avatar upload was successful
    if (!profilepic) {
        throw new CustomApiError(400, 'Profile picture file is required')
    }
    
    // Update user profile picture in the database
    const updatedUser = await User.findByIdAndUpdate(
        id, 
        { profilepic: profilepic.url }, 
        { new: true, runValidators: true }
    ).select('-password -refreshToken')
    
    // Throw an error if user update fails
    if (!updatedUser) {
        throw new CustomApiError(500, 'Server was unable to update the user please try again later!')
    }
    
    // Return the updated user details in the response
    return res.status(200).json({
        status: 'success',
        message: 'User updated successfully',
        user: updatedUser
    })
})

/**
 * Changes the user's password after verifying current password
 * 
 * @param {Object} req - Express request object with authenticated user and password data
 * @param {Object} res - Express response object
 * @returns {Object} Success message and updated user object
 * @throws {CustomApiError} For password validation failures
 */
const changeCurrentPassword = asyncHandler(async (req, res) => {
    try {
        // Check if the user is authenticated
        if (!req.user) {
            throw new CustomApiError(401, 'Unauthorized access!')
        }
        
        // Destructure new and old password from request body
        const { oldPassword, newPassword, confirmPassword } = req.body
       
        // Find the user using the logged-in user's ID
        const user = await User.findById(req.user._id).select('-refreshToken')

        // Check if the provided old password matches the stored password
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
        if (!isPasswordCorrect) {
            throw new CustomApiError(401, 'The old password you have entered is not correct!')
        }

        // Validate if new password matches the confirm password
        if (newPassword !== confirmPassword) {
            throw new CustomApiError(401, 'The new password and confirm password you have entered are not the same!')
        }

        // Update the user's password
        user.password = newPassword

        // Save the updated user information
        await user.save({ validateBeforeSave: true })

        // Return success response with user data
        return res.status(200).json({
            status: 'success',
            message: 'Password changed successfully!',
            user: user
        })

    } catch (error) {
        if (error instanceof CustomApiError) throw error;
        throw new CustomApiError(500, 'Something went wrong while changing the password please try again later!')
    }
})

/**
 * Retrieves the currently logged-in user's profile data
 * 
 * @param {Object} req - Express request object with authenticated user
 * @param {Object} res - Express response object
 * @returns {Object} User object without sensitive fields
 * @throws {CustomApiError} If user is not authenticated or not found
 */
const getLoggedInUser = asyncHandler(async (req, res) => {
    // Check if the user is authenticated
    if (!req.user) {
        throw new CustomApiError(401, 'Unauthorized access!')
    }

    // Fetch the logged-in user from the database
    const user = await User.findById(req.user._id).select('-password -refreshToken')

    // Throw an error if user is not found
    if (!user) {
        throw new CustomApiError(404, 'User not found!')
    }

    // Return the logged-in user details in the response
    return res.status(200).json(user)
})

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUser,
    UpdateDetails,
    UpdateProfilePic,
    changeCurrentPassword,
    getLoggedInUser
}