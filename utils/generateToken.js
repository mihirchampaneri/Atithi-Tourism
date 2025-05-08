// const jwt = require('jsonwebtoken');
// const generateToken = (user) => {
//     console.log(process.env.JWT_KEY);
//     return jwt.sign({email: user.email, id: user._id}, process.env.JWT_KEY, { expiresIn: "7d" });
// };

// module.exports.generateToken = generateToken;

const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        {
            email: user.email,
            id: user._id,
            role: user.role || "user" // default to 'user' if role is missing
        },
        process.env.JWT_KEY,
        { expiresIn: "1d" }
    );
};

module.exports.generateToken = generateToken;
