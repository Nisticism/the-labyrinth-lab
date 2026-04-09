import React from 'react'
import './faq.css'
import QuestionAnswer from '../faq_question_answer/FAQQuestionAnswer';
import { Link } from 'react-router-dom';

const FAQ = () => {

  const faqs = [
    {id: 1, question: "What is The Labyrinth Lab?", answer: "The Labyrinth Lab is a custom woodworking studio specializing in handcrafted labyrinths, chess boards, charcuterie boards, pens, furniture, and more."},
    {id: 2, question: "Do you take custom orders?", answer: "Yes! Visit our Commissions page or use the contact form to discuss your custom project."},
    {id: 3, question: "What types of wood do you use?", answer: "We work with a wide variety of domestic and exotic hardwoods, selected to match the needs of each project."},
    {id: 4, question: "How can I see your work?", answer: "Check out the Gallery page for photos of completed projects across all categories."},
    {id: 5, question: "Do you sell at markets?", answer: "Yes! Visit our Markets page for upcoming event dates and locations."}]

  return (
    <div>
      <div className="text-align">
        <h2 className="heading">Frequently Asked Questions</h2>
        <div className="faq-descript-container">
          <span className="faq-descript">Still have a question?  <Link to="/contact" target="_blank" rel="noreferrer">Contact us here</Link>.</span>
        </div>
        {/* <hr /> */}
      </div>
      <div className="faqs">
        { faqs.map((QA) => {
          return <QuestionAnswer key={QA.id} questionAnswerData={QA}/>
        })}
      </div>
    </div>
  )
}

export default FAQ