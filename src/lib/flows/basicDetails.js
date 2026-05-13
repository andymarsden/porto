import { command } from "$app/server";
import { options } from "marked";

export const basicDetailsFlow = {
    id: "basic-details",

    steps: [
        {
            id: "name",
            question: "### Details\n\n\n*These questions help us understand where and when the conversation is happening, and what brought someone here today. They also tell us whether this is a first visit about an issue or part of something ongoing, which helps us understand how and when support is being accessed.*\n\n---\n\nWhich hub did you attend?"
            , options: ["[a] Porto Hub", "[b] Porto Online", "[c] Other"]
        },
        {
            id: "when-attended",
            question: "When did you attend?",
        },
        {
            id: "postcode",
            question: "What is your postcode?",
            command: "basicDetails.getPostcodeInfo"
        },

        {
            id: "age",
            question: "What is your age?"
        },

        {
            id: "age-band",
            question: "### About you\n\n*These questions help us understand who we are reaching—and who we might be missing. By collecting some simple, non-identifying information, we can make sure support is reaching people from all backgrounds, ages, and communities.*\n\n*It also helps us spot patterns in need and access, so we can improve what we do and make services more inclusive.*\n\n*You dont have to answer everything—just what youre comfortable sharing.*\n\n*We never collect names, full addresses, or anything that could identify someone.*\n\n---\n\n| Why we ask | What we do with it |\n|---|---|\n| Age range | Understand which age groups are accessing support |\n| Area information | Identify gaps in service coverage |\n| Background information | Help improve inclusivity and fairness |\n\n---\n\n**Question:** Which age band do you fall into?",
            options: ["[a] Under 18", "[b] 18-24", "[c] 25-34", "[d] 35-44", "[e] 45-54", "[f] 55-64", "[g] 65+"]
        }





    ]
};