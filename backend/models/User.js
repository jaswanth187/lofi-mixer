const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  googleId: String,
  username: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: function () {
      return this.provider === "local";
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  firstName: String,
  lastName: String,
  profilePicture: String,
  provider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  // Add password reset fields
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  created: {
    type: Date,
    default: Date.now,
  },
});
userSchema.pre("save", async function (next) {
  // Only hash if password is modified and provider is local
  if (!this.isModified("password") || this.provider === "google") {
    return next();
  }

  try {
    // Use consistent salt rounds
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update password comparison method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = resetToken;
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  return resetToken;
};

// Method to clear password reset token
userSchema.methods.clearPasswordResetToken = function () {
  this.resetPasswordToken = undefined;
  this.resetPasswordExpires = undefined;
};

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.username;
});

const User = mongoose.model("User", userSchema);

module.exports = User;
