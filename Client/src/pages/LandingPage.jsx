import React from "react";
import svedana from "../assets/svedana.png";
import snehan from "../assets/snehan.png";
import { Leaf, ArrowRight, CheckCircle, Sparkles, Wind, Flame, Droplets } from "lucide-react";

// A constant for the source link to avoid repetition
const AYURVEDA_SOURCE_URL = "https://ayurveda.com/introduction-to-panchakarma/";

export default function LandingPage() {
  // Data for sections to keep the JSX cleaner
  const tridoshaData = [
    {
      name: "Vata",
      desc: "Movement, nervous system, elimination. In balance: creativity and flexibility; out of balance: anxiety, insomnia, constipation.",
      color: "from-sky-400 to-blue-500",
      icon: <Wind className="h-8 w-8 text-sky-500" />
    },
    {
      name: "Pitta",
      desc: "Transformation, metabolism, digestion. In balance: sharp intellect and lustre; out of balance: heat, rashes, irritability.",
      color: "from-amber-400 to-orange-500",
      icon: <Flame className="h-8 w-8 text-amber-500" />
    },
    {
      name: "Kapha",
      desc: "Structure, stability, immunity. In balance: stamina and calm; out of balance: heaviness, lethargy, congestion.",
      color: "from-emerald-400 to-teal-500",
      icon: <Droplets className="h-8 w-8 text-emerald-500" />
    },
  ];

  const shodanasData = [
    { name: "Vamana", text: "Therapeutic emesis to eliminate aggravated Kapha and respiratory congestion." },
    { name: "Virechana", text: "Therapeutic purgation to reduce excess Pitta and clear bile-related disorders." },
    { name: "Basti", text: "Medicated enema to modulate Vata and address deep-seated imbalances." },
    { name: "Nasya", text: "Nasal administration supporting prana, cognition, and sinus health." },
    { name: "Rakta Moksha", text: "Traditional blood purification techniques for certain inflammatory conditions." },
  ];

  const benefitsData = [
    "Eliminates toxins and clears channels",
    "Restores constitutional balance (Vata, Pitta, Kapha)",
    "Strengthens immunity and resilience",
    "Reverses stress effects and supports healthy aging",
    "Promotes deep relaxation and mental clarity",
    "Improves digestion and metabolic function"
  ];

  const lifestyleData = [
    "Plenty of rest; avoid strenuous activity and late nights",
    "Keep warm; minimize exposure to wind and cold",
    "Simple, warm, soupy diet (like kitchari); avoid cold foods",
    "Limit sensory input; practice mindfulness and gentle yoga"
  ];

  const SectionHeader = ({ title }) => (
    <div className="flex items-center gap-4 mb-8">
      <Leaf className="h-7 w-7 text-emerald-600" />
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">{title}</h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-700">
      {/* Top Bar Brand */}
      <header className="w-full bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <Leaf className="h-7 w-7 text-emerald-700" />
          <span className="text-emerald-800 font-extrabold text-2xl tracking-tight">AyurSutra</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-16">

        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-900 text-white shadow-2xl shadow-emerald-900/20">
          {/* Remove the image overlay */}
          {/* <div className="absolute inset-0 pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop"
              alt="Ayurvedic herbs"
              className="absolute right-0 top-0 h-full w-2/3 object-cover opacity-30"
              style={{ objectPosition: 'right center' }}
            />
            <div className="absolute inset-0 bg-gradient-to-l from-emerald-900/80 to-transparent"></div>
          </div> */}
          <div className="relative px-8 py-20 md:px-16 md:py-24 lg:py-32">
            {/* AyurSutra Brand */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20">
                <Leaf className="h-6 w-6" />
              </div>
              <span className="text-emerald-200 font-bold tracking-wide uppercase text-lg flex items-center gap-2">
                AyurSutra
              </span>
              <span className="text-emerald-100 text-sm font-medium">Classical Ayurveda</span>
            </div>
            <div className="max-w-xl mb-12">
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-3">Panchakarma</h1>
              <p className="flex items-center gap-2 text-lg md:text-2xl font-medium mb-8">
                <Sparkles className="h-5 w-5 text-emerald-300" />
                The Ultimate Mind-Body Cleanse for Rejuvenation
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="inline-flex items-center rounded-full bg-white text-emerald-700 px-6 py-3 font-semibold shadow hover:bg-emerald-50 transition-all duration-200"
                >
                  Patient/Doctor Login <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <a
                  href={AYURVEDA_SOURCE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10 transition-all duration-200"
                >
                  Learn the Tradition
                </a>
              </div>
            </div>
            {/* Optionally, you can add a blank div for spacing on large screens */}
            <div className="hidden md:block w-1/3"></div>
          </div>
        </section>

        {/* What is Panchakarma */}
        <section>
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-4">What is Panchakarma?</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Panchakarma is an individualized therapeutic cleanse and rejuvenation
              program rooted in the Ayurvedic understanding of the five elements and
              the three doshas—Vata, Pitta, and Kapha. Disturbance of this balance
              leads to disorder; Panchakarma restores order through staged
              preparation and targeted cleansing.
            </p>
          </div>
        </section>

        {/* Tridosha Overview */}
        <section>
          <SectionHeader title="The Ayurvedic Tridosha" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tridoshaData.map((d) => (
              <div key={d.name} className="group relative bg-white rounded-2xl border border-gray-200/80 p-8 shadow-md shadow-gray-900/5 hover:shadow-xl hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1.5">
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-white rounded-full border border-gray-200/80 group-hover:border-emerald-300 transition-all duration-300`}>
                    {d.icon}
                </div>
                <h3 className="font-bold text-2xl text-gray-900 mb-3 mt-8 text-center">{d.name}</h3>
                <p className="text-gray-600 leading-relaxed text-center">{d.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Purvakarma */}
        <section>
          <SectionHeader title="Purvakarma – Pre-purification" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group rounded-2xl overflow-hidden bg-white border border-gray-200/80 shadow-md shadow-gray-900/5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <img
                className="h-60 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                src={snehan}
                alt="Oil massage"
              />
              <div className="p-8">
                <h4 className="font-bold text-xl text-gray-900 mb-2">Snehan (Oleation)</h4>
                <p className="text-gray-600 leading-relaxed">
                  Therapeutic oiling and massage to mobilize toxins toward the GI
                  tract and nourish the nervous system.
                </p>
              </div>
            </div>
            <div className="group rounded-2xl overflow-hidden bg-white border border-gray-200/80 shadow-md shadow-gray-900/5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <img
                className="h-60 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                src={svedana}
                alt="Herbal steam"
              />
              <div className="p-8">
                <h4 className="font-bold text-xl text-gray-900 mb-2">Svedana (Sudation)</h4>
                <p className="text-gray-600 leading-relaxed">
                  Herbal steam/sweating that liquefies and moves toxins into the
                  GI tract, preparing for cleansing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Five Shodanas */}
        <section>
          <SectionHeader title="Five Shodanas – Cleansing Methods" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shodanasData.map((s, i) => (
              <div key={s.name} className="group relative bg-white rounded-2xl border border-gray-200/80 p-8 shadow-md shadow-gray-900/5 hover:shadow-xl hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1.5">
                <span className="absolute top-6 right-6 text-6xl font-black text-gray-100 group-hover:text-emerald-100 transition-colors duration-300">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="relative z-10">
                  <h4 className="font-bold text-xl text-gray-900 mb-3">{s.name}</h4>
                  <p className="text-gray-600 leading-relaxed">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Combined Benefits & Lifestyle Section */}
        <section className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-8 md:p-16 relative overflow-hidden">
            <Sparkles className="absolute -top-10 -right-10 h-64 w-64 text-white/10" strokeWidth={1} />
            <Sparkles className="absolute -bottom-16 -left-16 h-80 w-80 text-white/10" strokeWidth={1} />
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div>
                    <h3 className="text-3xl font-bold tracking-tight mb-8">Benefits of Panchakarma</h3>
                    <ul className="space-y-4">
                    {benefitsData.map((b, i) => (
                        <li key={i} className="flex items-start space-x-4">
                        <CheckCircle className="h-6 w-6 text-emerald-300 mt-1 flex-shrink-0" />
                        <span className="text-lg text-emerald-50">{b}</span>
                        </li>
                    ))}
                    </ul>
                </div>
                 <div>
                    <h3 className="text-3xl font-bold tracking-tight mb-8">Lifestyle During Therapy</h3>
                    <ul className="space-y-4">
                    {lifestyleData.map((item, i) => (
                        <li key={i} className="flex items-start space-x-4">
                         <div className="mt-1.5 flex-shrink-0 bg-teal-300 p-1 rounded-full"><div className="w-2.5 h-2.5 bg-white rounded-full"></div></div>
                         <span className="text-lg text-emerald-50">{item}</span>
                        </li>
                    ))}
                    </ul>
                </div>
            </div>
        </section>

        {/* Panchakarma Introduction - More Info */}
        <section>
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md border border-gray-200/80 p-8 mt-8">
            <h3 className="text-2xl font-bold text-emerald-800 mb-4">Why Panchakarma?</h3>
            <p className="text-gray-700 text-lg mb-4">
              Panchakarma is not just a detox—it’s a comprehensive healing process that addresses the root causes of disease. According to Ayurveda, toxins (ama) accumulate in the body due to poor digestion, stress, and environmental factors. Panchakarma therapies gently remove these toxins, restore digestive fire (agni), and rebalance the doshas.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li><strong>Personalized Care:</strong> Panchakarma is tailored to your unique constitution and health needs.</li>
              <li><strong>Stages:</strong> It includes preparation (purvakarma), cleansing (pradhankarma), and rejuvenation (paschatkarma).</li>
              <li><strong>Holistic Approach:</strong> Therapies combine diet, herbal remedies, massage, steam, and gentle yoga/meditation.</li>
            </ul>
            <p className="text-sm text-gray-500">
              Learn more at <a href="https://ayurveda.com/introduction-to-panchakarma/" className="text-emerald-700 underline" target="_blank" rel="noreferrer">ayurveda.com</a>.
            </p>
          </div>
        </section>

        {/* AyurSutra Benefits Section */}
        <section>
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md border border-gray-200/80 p-8 mt-8">
            <h2 className="text-3xl md:text-4xl font-bold text-emerald-700 mb-10 flex items-center gap-3">
              <Leaf className="h-7 w-7 text-emerald-700" />
              AyurSutra Benefits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* For Patients */}
              <div>
                <h3 className="text-xl font-bold text-emerald-700 mb-6 flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-emerald-700" />
                  For Patients
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <span className="bg-emerald-100 text-emerald-900 font-semibold px-3 py-1 rounded shadow">Guided Pre-, Main-, and Post-Procedure Support</span>
                    <span className="text-gray-700">Stepwise digital checklists and instructions for each therapy stage, ensuring safety and compliance.</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="bg-emerald-100 text-emerald-900 font-semibold px-3 py-1 rounded shadow">Personalized Calendar & Progress Tracker</span>
                    <span className="text-gray-700">AI generates a full therapy schedule with calendar sync and visual stage tracking.</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="bg-emerald-100 text-emerald-900 font-semibold px-3 py-1 rounded shadow">Digital Medical Records and Summaries</span>
                    <span className="text-gray-700">Access comprehensive health history, completed therapy logs, and medical summaries digitally.</span>
                  </div>
                </div>
              </div>
              {/* For Doctors */}
              <div>
                <h3 className="text-xl font-bold text-emerald-700 mb-6 flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-emerald-700" />
                  For Doctors
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <span className="bg-emerald-100 text-emerald-900 font-semibold px-3 py-1 rounded shadow">AI-Based Online Diagnostic & Planning</span>
                    <span className="text-gray-700">Intelligent, digital consultations, and AI generated Panchakarma schedules tailored to each diagnosis.</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="bg-emerald-100 text-emerald-900 font-semibold px-3 py-1 rounded shadow">Ayurvedic EMR with Full Patient History</span>
                    <span className="text-gray-700">Secure, structured EMR covering prescriptions, progress, before-after images, and multi-visit trends.</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="bg-emerald-100 text-emerald-900 font-semibold px-3 py-1 rounded shadow">Smart Patient and Therapy Schedule Management</span>
                    <span className="text-gray-700">Complete dashboard for daily, weekly, and ongoing patient sessions; dynamic stage tracking for all treatments.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
      
      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-emerald-700" />
                    <span className="text-gray-600 font-medium">Classical Ayurveda</span>
                </div>
                <p className="text-sm text-gray-500">
                    Content adapted from{" "}
                    <a
                    href={AYURVEDA_SOURCE_URL}
                    className="font-medium text-emerald-700 underline underline-offset-4 hover:text-emerald-800 transition-colors"
                    target="_blank"
                    rel="noreferrer"
                    >
                    ayurveda.com
                    </a>.
                </p>
                <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Panchakarma Wellness. All Rights Reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  );
}