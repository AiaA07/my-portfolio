export default function App() {
  return (
    <>
      <header>
        <h1>Aia Ahmed</h1>
        <nav>
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section id="about">
        <h2>About Me</h2>
        <p>Hi, I'm Aia Ahmed, a passionate and driven software engineering student at Gannon University, currently ending my senior year. At 21 years old, I'm actively seeking a software engineering, business analyst, product management, and other related tech full time jobs or internships where I can apply and grow my skills in a real-world environment. I'm also currently pursuing a part time job as a digital associate at Walmart.</p>
        <p>Through my academic journey, I've completed coursework in data structures and algorithms, java, python, linux, c++, htnl, css, javascript, swift, database management systems, project requirements & management, and more. I hold a Google Career Certificate in computer programming and I've been recognized by the National Technical Honor Society for my technical proficiency.</p>
        <p>I'm enthusiastic about collaborating with teams, learning through new challenges, and contributing to software solutions.</p>
      </section>

      <section id="projects">
        <h2>My Projects</h2>

        <div className="project">
          <h3>Homemade Food Ordering App</h3>
          <video width="400" controls>
            <source src="/videos/Mobile App 2 Project recording.mp4" type="video/mp4" />
          </video>
          <p>Was part of a team where we worked on a homemade food ordering app in sophmore year of university. We used android studio as our IDE and Java as our language. My teammate Blossom and I were in charge of the provider page where the provider can view the customer's orders and choose to accept or decline them. They can also view the pending orders. We also used the google map API so customers can search for resturants on the map.</p>
          <a href="https://github.com/QuangPhuLy7227/HomeMadeFood.git" target="_blank" rel="noreferrer">View on GitHub</a>
        </div>

        <div className="project">
          <h3>Sleep Analysis and Tracking App</h3>
          <video width="400" controls>
            <source src="/videos/SleepApp.mp4" type="video/mp4" />
          </video>
          <p>Is currently a part of team of 3 to develop a sleep analysis on xcode using swift. We have integrated motion sensors, microphone, and snore detection. We are currently working on smartwatch inegration to include the heart rate sensor.</p>
          <a href="https://github.com/alberico007/smarterpillow" target="_blank" rel="noreferrer">View on GitHub</a>
        </div>

        <div className="project">
          <h3>Cat Cafe Website</h3>
          <video width="400" controls>
            <source src="/videos/CatCafe.mp4" type="video/mp4" />
          </video>
          <p>Personally developed a cat cafe website using html, css, and javascript. It includes a hero section, cafe featured cats, gallery section, and testimonials.</p>
          <a href="https://github.com/AiaA07/CatCafe" target="_blank" rel="noreferrer">View on GitHub</a>
        </div>

        <div className="project">
          <h3>FTP Client Software Versions Comparison</h3>
          <div className="image-row">
            <a href="/images/3.2 Dependency Graph.png" target="_blank" rel="noreferrer">
              <img src="/images/3.2 Dependency Graph.png" alt="3.2 Dependency Graph" />
            </a>
            <a href="/images/3.3 Depenedency Graph.png" target="_blank" rel="noreferrer">
              <img src="/images/3.3 Depenedency Graph.png" alt="3.3 Dependency Graph" />
            </a>
            <a href="/images/StrategyPattern.png" target="_blank" rel="noreferrer">
              <img src="/images/StrategyPattern.png" alt="Strategy Pattern" />
            </a>
          </div>
          <p>Was part of a team where we worked on FTP Client software versions comparison project. We compared version to version. I was in charge of versions 3.2 and 3.3. And after we compared all versions from 3.2 to 3.6, we combined our findings and we came to the conclusion that as the version evolves, the less and less changes happen to it which might signify stability. We also needed to identify software design patterns in the given code. I was able to identify the strategy design pattern. The strategy design patern is a pattern that consists of a family of algorithms. It encapsulates each one and then makes them interchangable. In this case, the strategy pattern is used to dynamically switch between different FTP server listing parsers at runtime because each server type has unique directory listing formats that require specialized parsing. The understand tool was also used to extract the dependency graph of each version.</p>
        </div>

        <div className="project">
          <h3>Calculator App Testing</h3>
          <video width="400" controls>
            <source src="/videos/CalcApp.mp4" type="video/mp4" />
          </video>
          <p>Was part of a team where we worked on testing a calculator app. We added several features to the app and tested it using different java testing methods. I added the factorial and square root function. I then implemented unit testing. We also used Jenkins integration testing.</p>
          <a href="https://github.com/AiaA07/CalcAppGradle.git" target="_blank" rel="noreferrer">View on GitHub</a>
        </div>
      </section>

      <section id="contact">
        <h2>Contact</h2>
        <p>Email: ayooa0717@gmail.com</p>
      </section>

      <footer>
        <p>&copy; 2025 Aia Ahmed</p>
      </footer>
    </>
  )
}
