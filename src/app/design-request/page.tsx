'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Link from 'next/link'

// ─── 메달 용도 ───────────────────────────────────────────────────
const PURPOSE_OPTIONS = [
  { id: 'competition', label: '대회 시상', emoji: '🏆' },
  { id: 'corporate', label: '기업 행사', emoji: '🏢' },
  { id: 'graduation', label: '졸업 기념', emoji: '🎓' },
  { id: 'club', label: '클럽 / 동아리', emoji: '👥' },
  { id: 'promotion', label: '프로모션 / 굿즈', emoji: '🎁' },
  { id: 'other', label: '기타', emoji: '💬' },
]

// ─── 디자인 스타일 ───────────────────────────────────────────────
const STYLE_OPTIONS = [
  { id: 'classic', label: '클래식 / 전통적', emoji: '🏛️' },
  { id: 'modern', label: '모던 / 심플', emoji: '✨' },
  { id: 'cute', label: '귀여운 / 캐릭터', emoji: '🎨' },
  { id: 'luxury', label: '고급스러운', emoji: '💎' },
  { id: 'sporty', label: '스포티 / 역동적', emoji: '⚡' },
  { id: 'unsure', label: '잘 모르겠어요', emoji: '🤔' },
]

// ─── 사이즈 (참고용) ─────────────────────────────────────────────
const SIZE_OPTIONS = [
  { value: 'small', label: '소형 (44.5mm)' },
  { value: 'medium', label: '중형 (63.5mm)' },
  { value: 'large', label: '대형 (76.2mm)' },
  { value: 'unsure', label: '추천 받고 싶어요' },
]

// ─── 도금 색상 (참고용) ──────────────────────────────────────────
const FINISH_OPTIONS = [
  { id: 'gold', label: '금도금', color: 'bg-gradient-to-br from-yellow-300 to-amber-500' },
  { id: 'silver', label: '은도금', color: 'bg-gradient-to-br from-gray-200 to-gray-400' },
  { id: 'copper', label: '동도금', color: 'bg-gradient-to-br from-amber-600 to-orange-800' },
  { id: 'unsure', label: '추천 받고 싶어요', color: 'bg-gray-100' },
]

export default function DesignRequestPage() {
  // ─── 디자인 요청 정보 ───
  const [purpose, setPurpose] = useState('')
  const [purposeDetail, setPurposeDetail] = useState('')
  const [designStyle, setDesignStyle] = useState('')
  const [styleDescription, setStyleDescription] = useState('')
  const [medalText, setMedalText] = useState('')
  const [referenceFiles, setReferenceFiles] = useState<File[]>([])

  // ─── 대략적 사양 (선택) ───
  const [size, setSize] = useState('')
  const [quantity, setQuantity] = useState('')
  const [finish, setFinish] = useState('')

  // ─── 연락처 ───
  const [contactEmail, setContactEmail] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [extraNotes, setExtraNotes] = useState('')

  // ─── UI 상태 ───
  const [submitted, setSubmitted] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024)
    if (validFiles.length < files.length) {
      alert('10MB를 초과하는 파일은 제외되었습니다.')
    }
    setReferenceFiles(prev => [...prev, ...validFiles].slice(0, 5))
  }

  const removeFile = (index: number) => {
    setReferenceFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!purpose) { alert('메달 용도를 선택해주세요.'); return }
    if (!designStyle) { alert('원하는 스타일을 선택해주세요.'); return }
    if (!contactEmail) { alert('견적을 받으실 이메일을 입력해주세요.'); return }
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const StepHeader = ({ step, title, subtitle, required = true }: { step: number; title: string; subtitle: string; required?: boolean }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">{step}</div>
      <div>
        <h2 className="text-lg font-bold">
          {title} {required && <span className="text-red-500">*</span>}
        </h2>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>
    </div>
  )

  // ─── 접수 완료 화면 ───
  if (submitted) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-lg mx-auto px-4 py-20">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✉️</div>
            <h2 className="text-2xl font-bold mb-3">의뢰가 접수되었습니다!</h2>
            <p className="text-gray-500 mb-1">담당자가 확인 후 견적을 보내드리겠습니다.</p>
            <p className="text-gray-400 text-sm mb-8">
              <span className="text-amber-600 font-medium">{contactEmail}</span>으로 1~2 영업일 내에 견적서를 발송해 드립니다.
            </p>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8 text-left">
              <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-4">진행 절차</h3>
              <div className="space-y-4">
                {[
                  { step: '1', title: '의뢰 확인', desc: '담당자가 요청 내용을 확인합니다', active: true },
                  { step: '2', title: '견적서 발송', desc: '이메일로 상세 견적서를 보내드립니다' },
                  { step: '3', title: '디자인 초안', desc: '주문 확정 후 디자인 초안을 제작합니다' },
                  { step: '4', title: '수정 & 확정', desc: '피드백을 반영하여 디자인을 확정합니다' },
                  { step: '5', title: '제작 & 배송', desc: '확정된 디자인으로 메달을 제작합니다' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      item.active ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>{item.step}</div>
                    <div>
                      <p className={`font-semibold text-sm ${item.active ? 'text-gray-900' : 'text-gray-500'}`}>{item.title}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => { setSubmitted(false); window.scrollTo({ top: 0 }) }}
                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                새 의뢰하기
              </button>
              <Link href="/"
                className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 transition-colors text-center">
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="pt-20 bg-gray-50 min-h-screen">

        {/* ─── Hero ─────────────────────────────────────────────── */}
        <div className="bg-gray-900 text-white py-14 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
              <span className="text-amber-400 text-sm font-semibold">디자인 + 제작</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-5">디자인 의뢰하기</h1>
            <p className="text-gray-400 leading-relaxed">
              디자인 파일이 없어도 괜찮습니다. 원하는 느낌만 알려주시면
              <br className="hidden sm:block" />
              전문 디자이너가 디자인을 만들어 드립니다.
              <br className="hidden sm:block" />
              내용 확인 후 <span className="text-amber-400 font-medium">이메일로 견적서를 보내드립니다.</span>
            </p>
          </div>
        </div>

        {/* ─── 폼 ──────────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
          <form onSubmit={handleSubmit} className="space-y-12">

            {/* Step 1: 메달 용도 */}
            <section>
              <StepHeader step={1} title="메달의 용도가 무엇인가요?" subtitle="어떤 목적으로 메달을 제작하시나요" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PURPOSE_OPTIONS.map((opt) => (
                  <button type="button" key={opt.id} onClick={() => setPurpose(opt.id)}
                    className={`relative p-4 rounded-xl border-2 text-center transition-all ${
                      purpose === opt.id ? 'border-gray-900 bg-gray-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                    <span className="text-2xl block mb-2">{opt.emoji}</span>
                    <span className="font-semibold text-sm">{opt.label}</span>
                    {purpose === opt.id && (
                      <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                    )}
                  </button>
                ))}
              </div>
              {purpose && (
                <textarea value={purposeDetail} onChange={(e) => setPurposeDetail(e.target.value)} rows={2}
                  placeholder="예: OO마라톤 대회 1~3등 시상용, 참가자 전원 기념메달 등"
                  className="w-full mt-4 px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none" />
              )}
            </section>

            {/* Step 2: 원하는 스타일 */}
            <section>
              <StepHeader step={2} title="원하는 느낌이 있나요?" subtitle="메달 디자인의 방향을 알려주세요" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {STYLE_OPTIONS.map((opt) => (
                  <button type="button" key={opt.id} onClick={() => setDesignStyle(opt.id)}
                    className={`relative p-4 rounded-xl border-2 text-center transition-all ${
                      designStyle === opt.id ? 'border-gray-900 bg-gray-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                    <span className="text-2xl block mb-2">{opt.emoji}</span>
                    <span className="font-semibold text-sm">{opt.label}</span>
                    {designStyle === opt.id && (
                      <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                    )}
                  </button>
                ))}
              </div>
              <textarea value={styleDescription} onChange={(e) => setStyleDescription(e.target.value)} rows={2}
                placeholder="원하는 느낌을 자유롭게 설명해주세요 (선택사항)"
                className="w-full mt-4 px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none" />
            </section>

            {/* Step 3: 메달에 들어갈 내용 */}
            <section>
              <StepHeader step={3} title="메달에 들어갈 내용을 알려주세요" subtitle="텍스트, 로고, 심볼 등" required={false} />
              <textarea value={medalText} onChange={(e) => setMedalText(e.target.value)} rows={4}
                placeholder={"예:\n- 앞면: 회사 로고 + 'Employee of the Year 2026'\n- 뒷면: 수상자 이름 각인\n- 테두리에 월계수 무늬"}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none" />
            </section>

            {/* Step 4: 참고 이미지 */}
            <section>
              <StepHeader step={4} title="참고할 이미지가 있나요?" subtitle="비슷하게 만들고 싶은 이미지를 올려주세요" required={false} />
              <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-white transition-all bg-white">
                <input type="file" className="hidden" accept="image/*,.pdf" multiple onChange={handleFileChange} />
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">📎</div>
                <p className="font-semibold text-gray-700">이미지를 업로드하세요</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF (최대 5개, 각 10MB)</p>
              </label>
              {referenceFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {referenceFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-lg">📄</span>
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
                      </div>
                      <button type="button" onClick={() => removeFile(i)}
                        className="w-6 h-6 bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center text-xs transition-colors flex-shrink-0">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Step 5: 대략적 사양 */}
            <section>
              <StepHeader step={5} title="대략적인 사양을 알려주세요" subtitle="정확하지 않아도 괜찮아요, 견적에 참고됩니다" required={false} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">사이즈</label>
                  <select value={size} onChange={(e) => setSize(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all">
                    <option value="">선택하세요</option>
                    {SIZE_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">예상 수량</label>
                  <input type="text" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                    placeholder="예: 100개"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">도금 색상</label>
                  <select value={finish} onChange={(e) => setFinish(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all">
                    <option value="">선택하세요</option>
                    {FINISH_OPTIONS.map((f) => (
                      <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Step 6: 이메일 (필수) + 연락처 */}
            <section>
              <StepHeader step={6} title="견적을 받으실 이메일을 입력해주세요" subtitle="이메일로 견적서를 보내드립니다" />
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">이메일 <span className="text-red-500">*</span></label>
                  <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">이름 <span className="text-xs text-gray-400 font-normal">(선택)</span></label>
                    <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)}
                      placeholder="홍길동"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">전화번호 <span className="text-xs text-gray-400 font-normal">(선택)</span></label>
                    <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="010-0000-0000"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all" />
                  </div>
                </div>
                <textarea value={extraNotes} onChange={(e) => setExtraNotes(e.target.value)} rows={2}
                  placeholder="기타 요청사항이 있으면 적어주세요 (선택사항)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none" />
              </div>
            </section>

            {/* 안내 & 제출 */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div className="text-sm text-amber-800 leading-relaxed">
                  <p className="font-semibold mb-1">진행 안내</p>
                  <ul className="space-y-1 text-amber-700">
                    <li>• 의뢰 접수 후 1~2 영업일 내에 이메일로 견적서를 보내드립니다</li>
                    <li>• 견적 확인 후 주문 여부를 결정하시면 됩니다</li>
                    <li>• 주문 확정 시 디자인 초안을 제작하며, 만족하실 때까지 수정 가능합니다</li>
                  </ul>
                </div>
              </div>
            </div>

            <button type="submit"
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl">
              견적 의뢰하기
            </button>
            <p className="text-center text-xs text-gray-400 -mt-8">
              결제가 진행되지 않습니다. 견적서를 먼저 받아보세요.
            </p>
          </form>
        </div>
      </main>
    </>
  )
}
