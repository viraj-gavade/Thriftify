const fs = require('fs');
const path = require('path');
const uploadFile = require('../utils/cloudinary');
const Listing = require('../Schemas/listings.schemas');
const User = require('../Schemas/user.schemas');

const CreateListing = async (req, res) => {
    try {
        const { title, description, price, category,location } = req.body;
        const userId = req.user._id;

        const existingListing = await Listing.findOne({ title, user: userId });
        if (existingListing) {
            return res.status(400).json({ message: 'Listing already exists' });
        }

        // Upload each file to Cloudinary and get secure URLs
        const imageUploadPromises = req.files.map(file => uploadFile(file.path));
        const uploadedImages = await Promise.all(imageUploadPromises);
        const imageUrls = uploadedImages.map(img => img.secure_url);

        // Clean up temp files after upload
        req.files.forEach(file => {
            fs.unlink(path.join(__dirname, '..', file.path), err => {
                if (err) console.error(`Error deleting temp file ${file.path}:`, err);
            });
        });

        // Create the listing with uploaded image URLs
        const newListing = await Listing.create({
            title,
            description,
            price,
            category,
            images: imageUrls,
            postedBy: userId,
            location: location,
        });

        await User.findByIdAndUpdate(userId, { $push: { listings: newListing._id } });

        return res.status(201).json(newListing);
    } catch (error) {
        console.log(error);
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { CreateListing };
