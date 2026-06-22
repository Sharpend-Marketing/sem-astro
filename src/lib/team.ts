import type { ImageMetadata } from 'astro'
import chrisRicardImage from '../assets/team/chris-ricard.jpg'
import larryToubeImage from '../assets/team/larry-toube.png'

export interface TeamMember {
  slug: string
  name: string
  role: string
  metaDescription: string
  summary: string
  introduction: string
  about: string[]
  expertise: string[]
  image: ImageMetadata
  email: string
  linkedIn: string
}

export const teamMembers: TeamMember[] = [
  {
    slug: 'chris-ricard',
    name: 'Chris Ricard',
    role: 'Serial Entrepreneur, Always Marketing Strategy First!',
    metaDescription: 'Meet Chris Ricard, Sharp End Marketing strategist, serial entrepreneur, and Douglas College marketing instructor in Metro Vancouver.',
    summary: 'Chris brings experience building and operating ventures across web design, hosting, publishing, training, and entertainment. He has taught marketing at Douglas College since 2018 and pairs practical business experience with strategy-first thinking.',
    introduction: "From website and database design to hosting and publishing a magazine, I've started, operated, and sold a number of ventures.",
    about: [
      'My most recent venture was an escape room business called SmartyPantz. We had locations in Gastown, Edmonton, and Calgary, and were the first business of this type to open in Vancouver. There is a long story behind the idea, and I am always happy to share both the successes and challenges my partner and I experienced.',
      'It was a rollercoaster ride. Gastown was successful right out of the gate after taking longer and costing more to open than anticipated. Our goal was rapid growth, and we worried that opening additional Metro Vancouver locations might cannibalize Gastown, so we expanded into Alberta. In hindsight, we should have stayed local. The business made it through the first waves of the pandemic, but the third round was too much.',
    ],
    expertise: [
      'I have taught marketing at Douglas College since 2018 and thoroughly enjoy sharing experience with the next generation while learning a few things from them too. Connecting students with local businesses through service-learning opportunities is especially fulfilling because both parties gain from the experience.',
      'My earlier work includes running a website hosting and design company for more than a decade—before platforms such as WordPress existed—selling custom training and development services, and working directly with startups through Self-Employment Programs. That work focused on building sales and marketing plans, then coaching founders through their first year in business.',
    ],
    image: chrisRicardImage,
    email: 'chris@sharpendmarketing.com',
    linkedIn: 'https://www.linkedin.com/chrisricard',
  },
  {
    slug: 'larry-toube',
    name: 'Larry Toube',
    role: 'Design Thinking, Crafting Ideas into Impactful Realities',
    metaDescription: 'Meet Larry Toube, Sharp End Marketing creative leader with 20+ years of experience in web, mobile, social, and user-centred design.',
    summary: 'Larry brings more than 20 years of experience shaping web, mobile, and social experiences. He combines creative direction, technology, and hands-on collaboration to build user-focused work that engages audiences and drives meaningful results.',
    introduction: 'A creative powerhouse and strategic thinker, Larry blends innovation and insight to bring bold ideas to life. With a knack for storytelling and a passion for problem-solving, his work inspires, engages, and drives results.',
    about: [
      'I bring more than 20 years of experience to Sharp End, transforming web, mobile, and social platforms through thoughtful design. By merging creative ideas with strategic thinking, my goal is to deliver immersive, user-centred experiences that captivate audiences and drive meaningful results.',
      "My track record includes leading teams that transformed customer engagement through insightful, technology-driven solutions. Under my creative guidance, Sharp End continues to raise the standard for practical marketing and design work.",
    ],
    expertise: [
      'My approach is hands-on. I engage deeply with clients and projects to create designs that resonate, while encouraging collaboration, experimentation, and a steady pursuit of better work.',
      'My passion is helping businesses solve design challenges and showing how focused, high-quality design can strengthen their customer experience and support growth.',
    ],
    image: larryToubeImage,
    email: 'larry@sharpendmarketing.com',
    linkedIn: 'https://www.linkedin.com/larrytoube',
  },
]
