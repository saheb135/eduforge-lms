import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, BookOpen, Lock, CheckCircle, ChevronRight, Star } from 'lucide-react';
import PaymentModal from './PaymentModal';

const subjectColors = {
  'Data Structures': { bg: 'rgba(14,165,233,0.15)', border: 'rgba(14,165,233,0.3)', text: '#38bdf8' },
  'Web Development': { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#34d399' },
  'Operating Systems': { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24' },
  'Machine Learning': { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)', text: '#a78bfa' },
  'Databases': { bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.3)', text: '#f472b6' },
};

const defaultColor = { bg: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.3)', text: '#94a3b8' };

export default function CourseCard({ course, enrollment, onEnrollSuccess }) {
  const [showPayment, setShowPayment] = useState(false);
  const navigate = useNavigate();
  const isEnrolled = enrollment?.paymentStatus === 'ACTIVE';
  const colors = subjectColors[course.subject] || defaultColor;

  const progress = enrollment?.attendance?.progressPercentage || 0;

  const handleAction = () => {
    if (isEnrolled) {
      navigate(`/course/${course.id}`);
    } else {
      setShowPayment(true);
    }
  };

  return (
    <>
      <div className="group relative rounded-2xl overflow-hidden card-hover cursor-pointer"
        style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
        onClick={handleAction}>

        {/* Course header gradient */}
        <div className="h-3 w-full"
          style={{ background: `linear-gradient(90deg, ${colors.text}80, ${colors.text}20)` }} />

        <div className="p-6">
          {/* Subject badge + status */}
          <div className="flex items-center justify-between mb-4">
            <span className="badge text-xs"
              style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
              {course.subject}
            </span>
            {isEnrolled && (
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">Enrolled</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-sky-300 transition-colors"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">
            {course.description}
          </p>

          {/* Instructor */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
              {course.instructor?.name?.charAt(0)}
            </div>
            <div>
              <div className="text-sm text-slate-300 font-medium">{course.instructor?.name}</div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{course._count?.materials || 0} lessons</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{course._count?.enrollments || 0} students</span>
            </div>
          </div>

          {/* Progress bar (if enrolled) */}
          {isEnrolled && (
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Progress</span>
                <span className="text-white font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Price + CTA */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                ₹{course.monthlyPrice}
              </span>
              <span className="text-slate-500 text-xs ml-1">/month</span>
            </div>
            <button
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isEnrolled
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30'
                  : 'text-white hover:shadow-lg'
              }`}
              style={!isEnrolled ? {
                background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
              } : {}}>
              {isEnrolled ? (
                <>Go to Course <ChevronRight className="w-4 h-4" /></>
              ) : (
                <><Lock className="w-3.5 h-3.5" /> Enroll Now</>
              )}
            </button>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          course={course}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            onEnrollSuccess?.();
          }}
        />
      )}
    </>
  );
}
