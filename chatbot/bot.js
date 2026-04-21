/**
 * Chatbot Logic - AI Scholarship Assistant
 * Handles intent recognition and automated responses.
 */

class ScholarshipChatbot {
    constructor() {
        this.intents = {
            "GREETING": ["hi", "hello", "hey", "start"],
            "STATUS": ["status", "where is my application", "pending", "approved"],
            "FIND_SCHOLARSHIP": ["recommend", "find", "search", "eligible"],
            "HELP": ["help", "guide", "how to apply"]
        };
    }

    // Basic Intent Matching (NLP Mock)
    getIntent(message) {
        message = message.toLowerCase();
        for (const [intent, keywords] of Object.entries(this.intents)) {
            if (keywords.some(kw => message.includes(kw))) {
                return intent;
            }
        }
        return "UNKNOWN";
    }

    processMessage(message, userContext = null) {
        const intent = this.getIntent(message);

        switch (intent) {
            case "GREETING":
                return "Hello! I'm your EduFund AI Assistant. How can I help you with your scholarship journey today?";
            
            case "STATUS":
                if (!userContext || !userContext.applicationId) {
                    return "Please provide your Application ID or login to check your status.";
                }
                // In reality, this would query the DB
                return `Your application #${userContext.applicationId} is currently under 'Verification'.`;
            
            case "FIND_SCHOLARSHIP":
                return "Based on your profile, I highly recommend the 'Global Excellence Scholarship'. It has a 95% match rate for you! Would you like to apply now?";
            
            case "HELP":
                return "To apply: 1. Update your profile. 2. Go to Dashboard. 3. Click 'Apply' on recommended scholarships. Let me know if you need specific help.";
            
            default:
                return "I'm not sure I understand. You can ask me about finding scholarships, checking your status, or how to apply.";
        }
    }
}

// Export for backend usage
module.exports = ScholarshipChatbot;

// Test
const bot = new ScholarshipChatbot();
console.log(bot.processMessage("How do I find a scholarship?"));
console.log(bot.processMessage("What is my application status?", { applicationId: 1042 }));
