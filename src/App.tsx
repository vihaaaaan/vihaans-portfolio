import { ContentBox } from '@components';
import db from '../db.json';
import { SocialLink } from '@components/SocialLink';
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

function App() {

  return (
    <div className="flex flex-col bg-white max-w-2xl mx-auto">
      <div className="flex flex-col flex-1 my-16 mx-8">
        <div className='flex justify-between mb-4'>
          <div>
            <h1
              className="
                text-5xl font-serif tracking-tight
                bg-clip-text text-transparent
                bg-[linear-gradient(90deg,#111,#6b7280,#111)]
                bg-[length:200%_100%]
                animate-[shine_10s_linear_infinite]
              "
            >
              hi, i'm vihaan!
            </h1>

            <style>
            {`
            @keyframes shine {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
            `}
            </style>
            <h3 className='
                text-lg font-sans tracking-tight
                bg-clip-text text-transparent
                bg-[linear-gradient(90deg,#111,#6b7280,#111)]
                bg-[length:200%_100%]
                animate-[shine_10s_linear_infinite]'
            >
              i love building digital products that people want.
            </h3>
          </div>
          <div className="flex space-x-4">
            <SocialLink icon={FaGithub} link={"https://github.com/vihaaaaan"}/>
            <SocialLink icon={FaLinkedin} link={"https://www.linkedin.com/in/vihaan-vulpala/"}/>
            <SocialLink icon={FaTwitter} link={""}/>
          </div>
        </div>
        <div className='mb-6 space-y-2'>
          <p className='text-sm font-sans text-gray-500'> 
            I'm currently building <a className="text-base font-serif italic underline hover:text-gray-700 leading-none">Paneld</a>, the Letterboxd for comic books, while working on AI agents for VCs at <a href="https://www.lioncrest.vc/" className="text-base font-serif italic underline hover:text-gray-700 leading-none">Lioncrest</a>. I'm also a student at <a href="https://cse.osu.edu/" className="text-base font-serif italic underline hover:text-gray-700 leading-none">Ohio State University</a>, where I'm exploring my interests in software engineering, design, and startups.
          </p>
          {/* <p className='text-sm font-sans text-gray-500 mb-2'> 
            In my free time I consume superhero media, watch Ohio sports, and play pickup basketball.
          </p> */}
          <p className="text-sm font-sans text-gray-500">
            I love meeting new people and am always open to exploring new opportunities! Feel free to reach out at <a href="mailto:vihaanv14@gmail.com" className="hover:text-gray-700 underline decoration-dotted">vihaanv14@gmail.com</a>
          </p>
        </div>  

        <div className="flex-1">
          <ContentBox data={db}>
          </ContentBox>
        </div>
      </div>
    </div>
  )
}

export default App
