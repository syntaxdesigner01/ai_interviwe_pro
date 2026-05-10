import SplashScreen from './SplashScreen'
import Navbar from './Navbar'
import InterviewForm from './InterviewForm'
import QuestionsList from './QuestionsList'

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-bl from-sky-100 to-indigo-300 font-sans">
      <SplashScreen />
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="">
          <h1 className="text-3xl font-bold text-center text-gray-900 tracking-tight">
            Interview Questions Generator
          </h1>

        </div>

        <InterviewForm />
        <QuestionsList />
      </main>
    </div>
  )
}
