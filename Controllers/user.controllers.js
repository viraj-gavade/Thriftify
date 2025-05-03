const uploadFile = require('../utils/cloudinary') // Utility to handle file uploads to Cloudinary
const User = require('../Schemas/user.schemas') // User model for database operations
const bcryptjs = require('bcrypt') // Library for hashing passwords
const jwt = require('jsonwebtoken') // Library for generating JWT tokens
const asyncHandler = require('../utils/asynchandler') // Middleware for handling async errors in Express
const CustomApiError = require('../utils/apiErrors') // Custom error handling class
const ApiResponse = require('../utils/apiResponse') // Custom error handling class

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
        // Log the error and throw a custom API error if token generation fails
        console.log("Access token Error:-", error)
        throw new CustomApiError(500, 'Something went wrong while generating the access and refresh token!')
    }
}


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
    const exstinguser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (exstinguser) {
        throw new CustomApiError(409, 'User already exists')
    }

    // Check if the profilepic file was uploaded, and throw an error if not
    const profilepicLocalpath = req.files?.profilepic[0]?.path
    
    if (profilepicLocalpath === undefined) {
        throw new CustomApiError(404, 'Avatar must be uploaded!')
    }

    // Upload avatar and cover image to Cloudinary
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

    // Redirect the user to the signup confirmation page
    return res.status(201).redirect('/api/v1/user/login')
})


const loginUser = asyncHandler(async (req, res) => {
    // Destructure request body to get identifier and password
    const { email, password } = req.body
   

    const user = await User.findOne({
        email: email.toLowerCase()
    })
    
    // Throw an error if user is not found
    if (!user) {
        throw new CustomApiError(404, 'User not found!')
    }

    // Check if the provided password matches the stored password
    const ValidPassword = await user.isPasswordCorrect(password)
    if (!ValidPassword) {
        throw new CustomApiError(401, 'Invalid user credentials!')
    }

    // Generate access and refresh tokens for the logged-in user
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)

    // Fetch the logged-in user without sensitive fields like password and refreshToken
    const loggedInUser = await User.findById(user._id).select('-password -refreshToken')

    // Cookie options for secure and HTTP-only cookies
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict'
    };

    // Send the generated tokens in cookies and redirect to home page
    return res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .redirect('/');
})

// Async handler to manage user logout functionality
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
            secure: true,
            sameSite: 'Strict',
            path: '/',
            domain: req.hostname.includes('localhost') ? 'localhost' : req.hostname
        };
        
        // Clear cookies and redirect
        
        return res.status(200)
            .clearCookie('accessToken', options)
            .clearCookie('refreshToken', options)
            .redirect('/');
    } catch (error) {
        console.error("Logout error:", error);
        throw new CustomApiError(500, 'Something went wrong during logout');
    }
});

    
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

const UpdateDetails = asyncHandler(async (req, res) => {
    if(!req.user){
        throw new CustomApiError(401, 'Unauthorized access!')
    }
    
    const { id } = req.user
    const Finduser = await User.findById(id).select('-password -refreshToken')
    
    if (!Finduser) {
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
            user: Finduser
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

const UpdateProfilePic = asyncHandler(async (req, res) => {
    if(!req.user){
        throw new CustomApiError(401, 'Unauthorized access!')
    }
    const { id } = req.user
    const Finduser = await User.findById(id).select('-password -refreshToken')
    if (!Finduser) {
        throw new CustomApiError(404, 'User not found!')
    }
    // Check if the profilepic file was uploaded, and throw an error if not
    const profilepicLocalpath = req.files?.profilepic[0]?.path
    
    if (profilepicLocalpath === undefined) {
        throw new CustomApiError(404, 'profilepic must be uploaded!')
    }
    // Upload avatar and cover image to Cloudinary
    const profilepic = await uploadFile(profilepicLocalpath)
    // Validate if avatar upload was successful
    if (!profilepic) {
        throw new CustomApiError(400, 'Avatar file is required')
    }
    // Update user profile picture in the database
    const updatedUser = await User.findByIdAndUpdate(id, { profilepic: profilepic.url }, { new: true, runValidators: true }).select('-password -refreshToken')
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

const changeCurrentPassword = asyncHandler(async (req, res) => {
    try {
        // Check if the user is authenticated
        if (!req.user) {
            throw new CustomApiError(401, 'Unauthorized access!')
        }
        // Destructure new and old password from request body
        const { oldPassword, newPassword, confirmPassword } = req.body
       
        // Find the user using the logged-in user's ID
        const user = await User.findById(req.user._id).select(' -refreshToken')

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

        // Redirect the user to their channel page after successful password change
        return res.status(200).json({
            status: 'success',
            message: 'Password changed successfully!',
            user: user
        })

    } catch (error) {
        // Log error and throw custom error for any issues during password change
        console.log(error)
        throw new CustomApiError(500, 'Something went wrong while changing the password please try again later!')
    }
})

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