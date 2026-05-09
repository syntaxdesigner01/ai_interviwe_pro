import InterviewForm from './InterviewForm'
import QuestionsList from './QuestionsList'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Interview Questions Generator
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            Enter a job title and get 3 tailored interview questions powered by AI.
          </p>
        </div>
        <InterviewForm />
        <QuestionsList />
      </main>
    </div>
  )
}
