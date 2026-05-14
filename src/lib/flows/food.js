export const foodFlow = {
    id: "favorite-food",

   steps: [
        {
            id: "hub",
            question: "### Details\n\n\n---\n\n\nThese questions help us understand where and when the conversation is happening, and what brought someone here today. They also tell us whether this is a first visit about an issue or part of something ongoing, which helps us understand how and when support is being accessed.\n\n---\n\n **Questions**\n\nWhich hub did you attend?"
            ,options: ["[a] Chester -Tomorrows Women", "[b] Chester Blacon", "[c] Chester City Centre", "[d] Ellesmere Port", "[e] Frodsham", "[f] Helsby", "[g] Lache", "[h] Malpas", "[i] Neston", "[j] Northwich", "[k] Tarporley", "[l] Winsford"]
        },
        {
            id:"when_attended",
            question: "When did you attend the talking point?",
        },
        {
            id:"reason_for_visit",
            question: "What brought you to the talking point today?",
        },
        {
            id:"first_visit",
            question: "Was this your first visit to the talking point about this issue?",
            options: ["Yes", "No"]
        },
        {
            id:"demographics_age_band",
            question: "### About You\n\n\n---\n\n\nThese questions help us understand who we are reaching—and who we might be missing. By collecting some simple, non-identifying information, we can make sure support is reaching people from all backgrounds, ages, and communities.\n\n\nIt also helps us spot patterns in need and access, so we can improve what we do and make services more inclusive.\n\n\nYou dont have to answer everything—just what youre comfortable sharing.\n\n\nWe never collect names, full addresses, or anything that could identify someone. \n\n\n---\n\n\n **Questions** \n\n\nWhat is your age band?",
            options: ["0-9", "10-17", "18-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80-89", "90+"]
        },
        {
            id:"demographics_postcode",
            question: "What is your postcode?",
             command: "basicDetails.getPostcodeInfo"
        },
        {
            id:"demographics_gender",
            question: "How do you describe your gender?",
            options: ["Male", "Female", "None Binary", "Prefer not to say"]
        },
        {
            id:"demographics_disability",
            question: "Would you describe yourself as having a disability?",
            options: ["Yes", "No"]
        },
        {
          //add new options
            id:"demographics_care_for_children",
            question: "Do you care for children?",
            options: ["No", "Yes - Pre-school age", "Yes - Primary School age", "Yes - Secondary School age"]
        },
        {
            id:"demographics_ethnicity",
            question: "How would you describe your ethnicity?",
            options: ["White", "Mixed / Multiple ethnic groups", "Asian / Asian British", "Black / African / Caribbean / Black British", "Other ethnic group"]
        },
        {
            id:"demographics_ethnicity_detail",
            question: "Would you like to provide more detail about your ethnicity?"
        },
        {
            id:"demographics_referral",
            question: "Where did you hear about us?"
        },
        {
            id:"wellbeing_coping",
            question: "### Wellbeing\n\n\n---\n\n\nThese questions help us understand the bigger picture—how someone is feeling day to day, how connected and in control they feel, and what might help improve things.\n\n\nWellbeing isn’t just about one thing—it’s shaped by our relationships, our sense of safety, how much choice we have, and how easy it is to do the things we enjoy.\n\n\nThe responses to these questions will help guide support in the right direction and show us where we might focus. It also helps us see the value and impact of our work when it makes a difference in people’s lives.\n\n\n---\n\n\n **Questions** \n\n\nHow well have you been coping with daily challenges?",
            options: ["0 - Not at all", "1 - Slightly", "2 - Somewhat", "3 - Fairly", "4 - Mostly", "5 - Completely"]
        },
        {
            id:"wellbeing_connected",
            question: "How connected do you feel to those important to you?",
            options: ["0 - Not at all", "1 - Slightly", "2 - Somewhat", "3 - Fairly", "4 - Mostly", "5 - Completely"]
        },
        {
            id:"wellbeing_control",
            question: "How much control do you feel you have over your life?",
            options: ["0 - Not at all", "1 - Slightly", "2 - Somewhat", "3 - Fairly", "4 - Mostly", "5 - Completely"]
        },
        {
            id:"wellbeing_safe",
            question: "How safe do you feel in your home or community?",
            options: ["0 - Not at all", "1 - Slightly", "2 - Somewhat", "3 - Fairly", "4 - Mostly", "5 - Completely"]
        },
        {
            id:"wellbeing_support",
            question: "How easy is it for you to access the support you need to do the things you enjoy?",
            options: ["0 - Not at all", "1 - Slightly", "2 - Somewhat", "3 - Fairly", "4 - Mostly", "5 - Completely"]
        },
        {
            id:"wellbeing_satisfaction",
            question: "Overall, how satisfied are you with your life?",
            options: ["0 - Not at all", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10 - Completely"]
        },
        {
          id:"next_steps",
          question: "### Next Steps\n\n\n---\n\n\nThis area is for recording and recording any actions agreed during the conversation. It’s an opportunity to reflect on the wellbeing responses and decide—together—what might help improve the person’s situation or resolve the situation.\n\n\nNext steps might include connecting with local support, accessing information or services or an introduction to other services or partners. They should be clear, achievable, and shaped jointly with the person wherever possible.\n\n\n---\n\n\n **Questions** \n\n\n Please record agreed actions or general notes only—no personal or identifying details should be recorded.",
          options: ["information, advice and guidance offered", "introduced to community activity", "introduction to health colleagues", "onward to adult social care", "connection to housing", "connection to other council service", "invited to return", "no further action - closed", "other"]
        },
        {
          id:"experience_venue",
          question: "### Experience\n\n\n---\n\n\nThese questions help us understand how the visit felt for the person attending—what worked well, and what could be improved.\n\n\nThis feedback is important. It helps us make sure hubs are welcoming, accessible, and useful, and that everyone is the service and support they expect and need in a way that feels right.\n\n\n---\n\n\n **Questions** \n\n\n How suitable did you find the venue?",
          options: ["0 - Not at all", "1 - Slightly", "2 - Somewhat", "3 - Fairly", "4 - Mostly", "5 - Completely"]
        },
        {
          id:"experience_welcome",
          question: "Did you feel welcome?",
          options: ["0 - Not at all", "1 - Slightly", "2 - Somewhat", "3 - Fairly", "4 - Mostly", "5 - Completely"]
        },
        {
          id:"experience_accessibility",
          question: "How easy was it to get here today?",
          options: ["0 - Not at all", "1 - Slightly", "2 - Somewhat", "3 - Fairly", "4 - Mostly", "5 - Completely"]
        },
        {
          id:"experience_info",
          question: "Did you get the information, advice, or guidance you needed?",
          options: ["0 - Not at all", "1 - Slightly", "2 - Somewhat", "3 - Fairly", "4 - Mostly", "5 - Completely"]
        },
        {
          id:"experience_outcome",
          question: "Were you satisfied with the outcome of your visit?",
          options: ["0 - Not at all", "1 - Slightly", "2 - Somewhat", "3 - Fairly", "4 - Mostly", "5 - Completely"]
        },
        {
          id:"experience_recommend",
          question: "Would you recommend this hub to someone in a similar position?",
          options: ["0 - Not at all", "1 - Slightly", "2 - Somewhat", "3 - Fairly", "4 - Mostly", "5 - Completely"]
        },
      ]
};