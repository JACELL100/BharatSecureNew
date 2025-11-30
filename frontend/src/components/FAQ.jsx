import { useState } from "react";

const FAQSection = () => {
  const [open, setOpen] = useState(null);

  const toggleOpen = (index) => {
    setOpen(open === index ? null : index);
  };

  const faqData = [
    {
      question: "How do I report an incident?",
      answer:
        "To report an incident, simply click the 'Report Incident' button on the homepage, fill out the form with the necessary details, and submit it. Our system will handle the rest.",
    },
    {
      question: "What kind of incidents can I report?",
      answer:
        "You can report various incidents such as accidents, natural disasters, health emergencies, road hazards, and more. Just provide accurate details so authorities can respond quickly.",
    },
    {
      question: "How will I know if my report has been resolved?",
      answer:
        "Once your incident is resolved, you'll receive a notification indicating its resolution status. You can also track it through your dashboard.",
    },
    {
      question: "Can I report incidents anonymously?",
      answer:
        "Yes, you can choose to report incidents anonymously. However, providing your contact details may help authorities respond more effectively.",
    },
    {
      question: "What happens after I submit a report?",
      answer:
        "After you submit your report, the incident will be reviewed by local authorities. You'll be updated on the status of your report in real time.",
    },
  ];

  return (
    <div className="py-12 bg-[#0f0f0f]">
      <h2 className="text-[#4da6a8] font-extrabold text-4xl lg:text-6xl tracking-wide mt-7 text-center mb-8 drop-shadow-[0_0_15px_rgba(77,166,168,0.5)] hover:drop-shadow-[0_0_20px_rgba(77,166,168,0.8)] transition-all duration-300">
        Frequently Asked Questions
      </h2>
      <div className="max-w-4xl mx-auto px-4">
        {faqData.map((item, index) => (
          <div key={index} className="mb-6">
            <button
              onClick={() => toggleOpen(index)}
              className="w-full text-left px-8 py-4 bg-[#1a1a1a] text-[#4da6a8] border border-[#4da6a8]/30 rounded-xl hover:shadow-[0_0_20px_rgba(77,166,168,0.3)] transition-all duration-300 focus:outline-none hover:-translate-y-1"
            >
              <span className="text-base font-medium lg:text-lg">
                {item.question}
              </span>
            </button>
            <div
              className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                open === index ? "max-h-40" : "max-h-0"
              }`}
            >
              <div className="px-8 py-5 bg-[#1a1a1a] text-gray-300 border border-t-0 border-[#4da6a8]/30 rounded-b-xl">
                <p>{item.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQSection;