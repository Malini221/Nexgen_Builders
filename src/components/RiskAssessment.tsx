import React from 'react';
import { motion } from 'motion/react';
import { AIAnalysisResult } from '../types';

export const RiskAssessmentCard: React.FC<{ assessment?: Pick<AIAnalysisResult, 'priority'|'risk_score'|'risk_signals'> | null; compact?: boolean }> = ({ assessment, compact }) => {
  if (!assessment) {
    return <div className="risk-card risk-low"><div className="risk-card-head"><div><div className="risk-eyebrow"><span className="risk-pulse" /> Risk assessment</div><div className="risk-title">Awaiting backend AI analysis</div></div><div className="risk-score">—<span>/100</span></div></div><p className="risk-action">Submit the complaint to FastAPI to receive a real model-generated risk score.</p></div>;
  }
  const tone = assessment.priority === 'CRITICAL' ? 'risk-critical' : assessment.priority === 'HIGH' ? 'risk-high' : assessment.priority === 'MEDIUM' ? 'risk-moderate' : 'risk-low';
  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`risk-card ${tone}`}>
    <div className="risk-card-head"><div><div className="risk-eyebrow"><span className="risk-pulse" /> Backend AI risk</div><div className="risk-title">{assessment.priority} priority</div></div><div className="risk-score">{assessment.risk_score}<span>/100</span></div></div>
    <div className="risk-meter"><motion.div initial={{ width: 0 }} animate={{ width: `${assessment.risk_score}%` }} transition={{ duration: .55 }} /></div>
    {!compact && <div className="risk-reasons">{assessment.risk_signals.length ? assessment.risk_signals.map((r) => <span key={r}>• {r}</span>) : <span>• Score returned by backend intelligence service</span>}</div>}
  </motion.div>;
};
