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
            command: "barnsley.search"
        },
        {
            id:"first_visit",
            question: "Was this your first visit to the talking point about this issue?",
            options: ["[a] Yes", "[b] No"]
        },
        {
            id:"demographics_age_band",
            question: "### About You\n\n\n---\n\n\nThese questions help us understand who we are reaching—and who we might be missing. By collecting some simple, non-identifying information, we can make sure support is reaching people from all backgrounds, ages, and communities.\n\n\nIt also helps us spot patterns in need and access, so we can improve what we do and make services more inclusive.\n\n\nYou dont have to answer everything—just what youre comfortable sharing.\n\n\nWe never collect names, full addresses, or anything that could identify someone. \n\n\n---\n\n\n **Questions** \n\n\nWhat is your age band?",
            options: ["[a] 0-9", "[b] 10-17", "[c] 18-29", "[d] 30-39", "[e] 40-49", "[f] 50-59", "[g] 60-69", "[h] 70-79", "[i] 80-89", "[j] 90+"]
        },
        {
            id:"demographics_postcode",
            question: "What is your postcode?",
             command: "basicDetails.getPostcodeInfo"
        },
        {
            id:"demographics_gender",
            question: "How do you describe your gender?",
            options: ["[a] Male", "[b] Female", "[c] None Binary", "[d] Prefer not to say"]
        },
        {
            id:"demographics_disability",
            question: "Would you describe yourself as having a disability?",
            options: ["[a] Yes", "[b] No"]
        },
        {
          //add new options
            id:"demographics_care_for_children",
            question: "Do you care for children?",
                        options: ["[a] No", "[b] Yes - Pre-school age", "[c] Yes - Primary School age", "[d] Yes - Secondary School age"]
        },
        {
            id:"demographics_ethnicity",
            question: "How would you describe your ethnicity?",
            options: ["[a] White", "[b] Mixed / Multiple ethnic groups", "[c] Asian / Asian British", "[d] Black / African / Caribbean / Black British", "[e] Other ethnic group"]
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
            options: ["[a] Not at all", "[b] Slightly", "[c] Somewhat", "[d] Fairly", "[e] Mostly", "[f] Completely"]
        },
        {
            id:"wellbeing_connected",
            question: "How connected do you feel to those important to you?",
            options: ["[a] Not at all", "[b] Slightly", "[c] Somewhat", "[d] Fairly", "[e] Mostly", "[f] Completely"]
        },
        {
            id:"wellbeing_control",
            question: "How much control do you feel you have over your life?",
            options: ["[a] Not at all", "[b] Slightly", "[c] Somewhat", "[d] Fairly", "[e] Mostly", "[f] Completely"]
        },
        {
            id:"wellbeing_safe",
            question: "How safe do you feel in your home or community?",
            options: ["[a] Not at all", "[b] Slightly", "[c] Somewhat", "[d] Fairly", "[e] Mostly", "[f] Completely"]
        },
        {
            id:"wellbeing_support",
            question: "How easy is it for you to access the support you need to do the things you enjoy?",
            options: ["[a] Not at all", "[b] Slightly", "[c] Somewhat", "[d] Fairly", "[e] Mostly", "[f] Completely"]
        },
        {
            id:"wellbeing_satisfaction",
            question: "Overall, how satisfied are you with your life?",
                   options: ["[0] - Not at all", "[1]", "[2]", "[3]", "[4]", "[5]", "[6]", "[7]", "[8]", "[9]", "[10] - Completely"]
       },
        {
          id:"next_steps",
          question: "### Next Steps\n\n\n---\n\n\nThis area is for recording and recording any actions agreed during the conversation. It’s an opportunity to reflect on the wellbeing responses and decide—together—what might help improve the person’s situation or resolve the situation.\n\n\nNext steps might include connecting with local support, accessing information or services or an introduction to other services or partners. They should be clear, achievable, and shaped jointly with the person wherever possible.\n\n\n---\n\n\n **Questions** \n\n\n Please record agreed actions or general notes only—no personal or identifying details should be recorded.",
                    options: ["[a] information, advice and guidance offered", "[b] introduced to community activity", "[c] introduction to health colleagues", "[d] onward to adult social care", "[e] connection to housing", "[f] connection to other council service", "[g] invited to return", "[h] no further action - closed", "[i] other"]
        },
        {
          id:"experience_venue",
          question: "### Experience\n\n\n---\n\n\nThese questions help us understand how the visit felt for the person attending—what worked well, and what could be improved.\n\n\nThis feedback is important. It helps us make sure hubs are welcoming, accessible, and useful, and that everyone is the service and support they expect and need in a way that feels right.\n\n\n---\n\n\n **Questions** \n\n\n How suitable did you find the venue?",
                    options: ["[a] Not at all", "[b] Slightly", "[c] Somewhat", "[d] Fairly", "[e] Mostly", "[f] Completely"]
        },
        {
          id:"experience_welcome",
          question: "Did you feel welcome?",
                    options: ["[a] Not at all", "[b] Slightly", "[c] Somewhat", "[d] Fairly", "[e] Mostly", "[f] Completely"]
        },
        {
          id:"experience_accessibility",
          question: "How easy was it to get here today?",
                    options: ["[a] Not at all", "[b] Slightly", "[c] Somewhat", "[d] Fairly", "[e] Mostly", "[f] Completely"]
        },
        {
          id:"experience_info",
          question: "Did you get the information, advice, or guidance you needed?",
                    options: ["[a] Not at all", "[b] Slightly", "[c] Somewhat", "[d] Fairly", "[e] Mostly", "[f] Completely"]
        },
        {
          id:"experience_outcome",
          question: "Were you satisfied with the outcome of your visit?",
                    options: ["[a] Not at all", "[b] Slightly", "[c] Somewhat", "[d] Fairly", "[e] Mostly", "[f] Completely"]
        },
        {
          id:"experience_recommend",
          question: "Would you recommend this hub to someone in a similar position?",
                    options: ["[a] Not at all", "[b] Slightly", "[c] Somewhat", "[d] Fairly", "[e] Mostly", "[f] Completely"]
        },
      ]
};