import { ContentBox, ExperienceBlock } from '@components';
import etsyLogo from './assets/etsylogo.jpeg';
import lioncrestLogo from './assets/lioncrestlogo.jpeg';

function App() {

  return (
    <div className="flex flex-col bg-white max-w-2xl mx-auto">
      <div className="flex flex-col flex-1 my-16 mx-8">
        <div className="mb-8">
          <h1 className='text-4xl font-serif mb-2'>hi, i'm vihaan!</h1>
          <h3 className='text-base font-sans text-gray-600 mb-2'>i love building digital products that people want.</h3>
          <p className='text-sm font-sans text-gray-500 mb-2'> 
            I'm building <a className="text-base font-serif italic underline hover:text-gray-700 leading-none">Paneld</a>, the Letterboxd for comic books, while working on AI agents for VCs at <a href="https://www.lioncrest.vc/" className="text-base font-serif italic underline hover:text-gray-700 leading-none">Lioncrest</a>. I'm also a student at <a href="https://cse.osu.edu/" className="text-base font-serif italic underline hover:text-gray-700 leading-none">Ohio State University</a>, where I'm exploring my interests in software engineering, design, and startups.
          </p>
          {/* <p className='text-sm font-sans text-gray-500 mb-2'> 
            In my free time I consume superhero media, watch Ohio sports, and play pickup basketball.
          </p> */}
          <p className="text-sm font-sans text-gray-500">
            I love meeting new people and exploring new opportunities, reach me at <a href="mailto:vihaanv14@gmail.com" className="font-bold underline hover:text-gray-700">vihaanv14@gmail.com</a>
          </p>  
        </div>

        <div className="flex-1">
          <ContentBox 
            ContentHeaderProps={{
              sectionTitle: "experience",
              sectionSubtitle: "Where I've worked—and what I've built"
            }}
          >
            <ExperienceBlock
                logoUrl={etsyLogo}
                companyName="Etsy"
                role="Software Engineering"
                isInternship={true}
                isPresent={false}
                startDate="May 2024"
                endDate="Aug 2024"
                description="Building features for Etsy's core marketplace, focusing on improving the buyer and seller experience through scalable and efficient solutions."
            />
            <ExperienceBlock
                logoUrl={lioncrestLogo}
                companyName="Lioncrest Ventures"
                role="Software Engineering"
                isInternship={false}
                isPresent={true}
                startDate="May 2024"
                endDate="Aug 2024"
                description="Building AI agents to assist VCs in sourcing and evaluating startup investments, leveraging machine learning and natural language processing techniques."
            />
            <ExperienceBlock
                logoUrl={lioncrestLogo}
                companyName="Lioncrest Ventures"
                role="Software Engineering"
                isInternship={false}
                isPresent={true}
                startDate="May 2024"
                endDate="Aug 2024"
                description="Building AI agents to assist VCs in sourcing and evaluating startup investments, leveraging machine learning and natural language processing techniques."
            />
            
            <h3 className="text-lg font-serif italic underline mt-4">education</h3>
            <ExperienceBlock
                logoUrl="https://cse.osu.edu/sites/default/files/2020-08/cse-seal.png"
                companyName="The Ohio State University"
                role="B.S. Computer Science"
                isInternship={false}
                isPresent={true}
                startDate="Aug 2022"
                endDate="May 2026"
                description="Relevant Coursework: Data Structures and Algorithms, Computer Systems, Software Engineering, Database Systems, Artificial Intelligence, Machine Learning."
            />

          </ContentBox>
          
        </div>
      </div>
    </div>
  )
}

export default App
