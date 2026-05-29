const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
    template_name: { type: String, required: true, trim: true },
    subject: { type: String, default: '' },
    html_content: { type: String, required: true },
    css_content: { type: String, default: '' },
    placeholders: [{ type: String }],
    logo: { type: String, default: '' },
    signature: { type: String, default: '' },
    header_image: { type: String, default: '' },
    footer_image: { type: String, default: '' },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Template', TemplateSchema);