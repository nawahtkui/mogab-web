import { apiFetch } from '../../api/client'
import { useEffect, useState } from 'react'

type PreparingPageProps = {
  projectId: string
  prompt: string
  onComplete: (projectId: string) => void
  onBack: () => void
}

type BuildState = 'starting' | 'building' | 'success' | 'error'
type DeployState = 'idle' | 'deploying' | 'success' | 'error'

const steps = [
  'تم إنشاء المشروع',
  'تحليل طلبك',
  'تشغيل محرك بناء MOGAB',
  'التحقق من عملية البناء',
  'تشغيل الاختبارات',
  'تجهيز المعاينة',
]

function PreparingPage({
  projectId,
  prompt,
  onComplete,
  onBack,
}: PreparingPageProps) {
  const [state, setState] = useState<BuildState>('starting')
  const [error, setError] = useState('')
  const [completedStep, setCompletedStep] = useState(0)

  const [deployState, setDeployState] =
    useState<DeployState>('idle')
  const [deployError, setDeployError] = useState('')
  const [deploymentUrl, setDeploymentUrl] =
    useState('')

  useEffect(() => {
    let cancelled = false

    const runBuild = async () => {
      try {
        setState('building')

        const response = await fetch(`/ai/build/${projectId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            maxIterations: 5,
          }),
        })

        const body = await response.json().catch(() => ({}))

        if (!response.ok || !body.success) {
          throw new Error(
            body.error ||
              body.message ||
              `Build failed (${response.status})`,
          )
        }

        if (cancelled) return

        setState('success')

        const revealSteps = [1, 2, 3, 4, 5]

        revealSteps.forEach((step, index) => {
          window.setTimeout(() => {
            if (!cancelled) {
              setCompletedStep(step)
            }
          }, 350 * (index + 1))
        })
      } catch (err) {
        if (cancelled) return

        setState('error')
        setError(
          err instanceof Error
            ? err.message
            : 'حدث خطأ أثناء تجهيز المشروع',
        )
      }
    }

    void runBuild()

    return () => {
      cancelled = true
    }
  }, [projectId, prompt])

  const deployProject = async () => {
    try {
      setDeployState('deploying')
      setDeployError('')
      setDeploymentUrl('')

      const response = await fetch('/deploy/auto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          provider: 'local',
        }),
      })

      const body = await response.json().catch(() => ({}))

      if (!response.ok || !body.success) {
        throw new Error(
          body.error ||
            body.message ||
            `Deployment failed (${response.status})`,
        )
      }

      const deploymentId = body.deploymentId

      if (!deploymentId) {
        throw new Error('لم يتم إنشاء معرّف النشر')
      }

      for (let attempt = 0; attempt < 30; attempt++) {
        await new Promise((resolve) =>
          window.setTimeout(resolve, 1000),
        )

        let statusBody: any

        try {
          statusBody = await apiFetch(`/deploy/${deploymentId}`)
        } catch (err) {
          throw err
        }

        if (!statusBody?.success) {
          throw new Error(
            statusBody.error ||
              'تعذر الحصول على حالة النشر',
          )
        }

        const deployment = statusBody.deployment

        if (deployment?.status === 'success' ||
            deployment?.status === 'completed' ||
            deployment?.status === 'live' ||
            deployment?.state === 'LIVE') {
          if (!deployment.url) {
            throw new Error('تم النشر ولكن لم يتم إرجاع الرابط')
          }

          setDeploymentUrl(deployment.url)
          setDeployState('success')
          onComplete(projectId)
          return
        }

        if (
          deployment?.status === 'failed' ||
          deployment?.status === 'error'
        ) {
          throw new Error(
            deployment.error ||
              'فشل نشر المشروع',
          )
        }
      }

      throw new Error('انتهت مهلة انتظار النشر')
    } catch (err) {
      setDeployState('error')
      setDeployError(
        err instanceof Error
          ? err.message
          : 'حدث خطأ أثناء النشر',
      )
    }
  }

  const isDone = (index: number) => {
    if (index === 0) return true
    return state === 'success' && completedStep >= index
  }

  const isActive = (index: number) => {
    if (state === 'error') return false

    if (state === 'success') {
      return completedStep + 1 === index
    }

    return index === 1
  }

  const currentStep =
    state === 'success'
      ? completedStep + 1
      : state === 'building'
        ? 1
        : 0

  const preparationComplete =
    state === 'success' && completedStep >= steps.length - 1

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 50% 45%, rgba(50,90,180,0.08), transparent 42%), #050505',
        color: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        fontFamily: 'inherit',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>
        {`
          @keyframes mogabScan {
            0% {
              transform: translateX(-120%);
              opacity: 0;
            }
            20% {
              opacity: 1;
            }
            80% {
              opacity: 1;
            }
            100% {
              transform: translateX(520%);
              opacity: 0;
            }
          }

          @keyframes mogabPulse {
            0%, 100% {
              box-shadow: 0 0 0 rgba(80,140,255,0);
            }
            50% {
              box-shadow:
                0 0 18px rgba(80,140,255,0.55),
                0 0 36px rgba(80,140,255,0.2);
            }
          }

          @keyframes mogabDot {
            0%, 100% {
              transform: scale(0.75);
              opacity: 0.5;
            }
            50% {
              transform: scale(1.15);
              opacity: 1;
            }
          }

          @keyframes mogabLine {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(300%);
            }
          }
        `}
      </style>

      <section
        style={{
          width: '100%',
          maxWidth: 760,
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.035)',
          borderRadius: 24,
          padding: '48px 36px 40px',
          boxSizing: 'border-box',
          overflow: 'hidden',
          backdropFilter: 'blur(18px)',
        }}
      >
        {state !== 'error' &&
          state !== 'success' &&
          deployState !== 'deploying' && (
            <div
              style={{
                position: 'absolute',
                inset: -2,
                borderRadius: 26,
                pointerEvents: 'none',
                background:
                  'linear-gradient(90deg, transparent, rgba(70,130,255,0.8), transparent)',
                filter: 'blur(8px)',
                animation:
                  'mogabScan 3.2s linear infinite',
                opacity: 0.35,
              }}
            />
          )}

        <div
          style={{
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 12,
              letterSpacing: '0.16em',
              opacity: 0.5,
              marginBottom: 18,
            }}
          >
            MOGAB BUILDER
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(32px, 6vw, 52px)',
              lineHeight: 1.05,
              fontWeight: 600,
            }}
          >
            {state === 'error'
              ? 'تعذر تجهيز المشروع'
              : deployState === 'success'
                ? 'تم النشر بنجاح'
                : deployState === 'deploying'
                  ? 'جارٍ نشر مشروعك'
                  : state === 'success'
                    ? 'اكتمل تجهيز المشروع'
                    : 'جارٍ تجهيز مشروعك'}
          </h1>

          <p
            style={{
              margin: '18px 0 36px',
              color: 'rgba(255,255,255,0.58)',
              lineHeight: 1.8,
              maxWidth: 620,
            }}
          >
            {state === 'error'
              ? error
              : deployState === 'success'
                ? 'تم نشر المشروع بنجاح. يمكنك فتح موقعك الآن.'
                : deployState === 'deploying'
                  ? 'يقوم MOGAB بنشر المشروع وتجهيز الرابط.'
                  : state === 'success'
                    ? 'تم بناء المشروع والتحقق منه. المشروع جاهز للنشر.'
                    : 'يقوم MOGAB بتحليل الوصف، تنفيذ البناء، ثم التحقق من النتيجة قبل فتح مساحة العمل.'}
          </p>

          <div
            style={{
              display: 'grid',
              gap: 10,
            }}
          >
            {steps.map((label, index) => {
              const done = isDone(index)
              const active = isActive(index)

              return (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '15px 18px',
                    borderRadius: 14,
                    background: active
                      ? 'rgba(55,110,220,0.12)'
                      : done
                        ? 'rgba(255,255,255,0.055)'
                        : 'rgba(255,255,255,0.025)',
                    border: active
                      ? '1px solid rgba(75,135,255,0.45)'
                      : '1px solid rgba(255,255,255,0.07)',
                    transition: 'all 450ms ease',
                    animation: active
                      ? 'mogabPulse 2s ease-in-out infinite'
                      : 'none',
                  }}
                >
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 13,
                      flexShrink: 0,
                      background: done
                        ? 'rgba(70,210,125,0.16)'
                        : active
                          ? 'rgba(65,125,255,0.18)'
                          : 'rgba(255,255,255,0.05)',
                      border: done
                        ? '1px solid rgba(70,210,125,0.45)'
                        : active
                          ? '1px solid rgba(80,140,255,0.55)'
                          : '1px solid rgba(255,255,255,0.08)',
                      color: done
                        ? '#72e6a0'
                        : active
                          ? '#7fb1ff'
                          : 'rgba(255,255,255,0.35)',
                    }}
                  >
                    {done ? '✓' : active ? '•' : index + 1}
                  </span>

                  <span
                    style={{
                      color:
                        done || active
                          ? '#fff'
                          : 'rgba(255,255,255,0.38)',
                    }}
                  >
                    {label}
                  </span>

                  {active && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: '#6ea8ff',
                        animation:
                          'mogabDot 1.2s ease-in-out infinite',
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {state !== 'error' && (
            <>
              <div
                style={{
                  marginTop: 34,
                  position: 'relative',
                  height: 4,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${Math.min(
                      100,
                      Math.max(
                        12,
                        ((currentStep + 1) /
                          steps.length) *
                          100,
                      ),
                    )}%`,
                    borderRadius: 999,
                    background:
                      'linear-gradient(90deg, rgba(70,120,255,0.25), rgba(90,150,255,0.95))',
                    transition: 'width 600ms ease',
                  }}
                />

                {state === 'building' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -3,
                      left: 0,
                      width: 90,
                      height: 10,
                      borderRadius: 999,
                      background:
                        'linear-gradient(90deg, transparent, rgba(130,180,255,0.9), transparent)',
                      filter: 'blur(2px)',
                      animation:
                        'mogabLine 2.2s linear infinite',
                    }}
                  />
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 10,
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.35)',
                }}
              >
                <span>البناء</span>
                <span>التحقق</span>
                <span>المعاينة</span>
              </div>
            </>
          )}

          {preparationComplete &&
            deployState !== 'success' && (
              <button
                type="button"
                onClick={() => void deployProject()}
                disabled={deployState === 'deploying'}
                style={{
                  width: '100%',
                  marginTop: 30,
                  padding: '16px 24px',
                  borderRadius: 14,
                  border:
                    '1px solid rgba(90,150,255,0.65)',
                  background:
                    deployState === 'deploying'
                      ? 'rgba(70,120,220,0.25)'
                      : 'linear-gradient(135deg, #3978ff, #2455c8)',
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor:
                    deployState === 'deploying'
                      ? 'wait'
                      : 'pointer',
                  boxShadow:
                    '0 10px 30px rgba(40,100,220,0.25)',
                }}
              >
                {deployState === 'deploying'
                  ? 'جارٍ النشر...'
                  : 'النشر'}
              </button>
            )}

          {deployState === 'error' && (
            <div
              style={{
                marginTop: 18,
                padding: '12px 14px',
                borderRadius: 12,
                border:
                  '1px solid rgba(255,90,90,0.25)',
                background:
                  'rgba(255,70,70,0.08)',
                color: '#ff9b9b',
                lineHeight: 1.7,
              }}
            >
              {deployError}
            </div>
          )}

          {deployState === 'success' &&
            deploymentUrl && (
              <div
                style={{
                  marginTop: 26,
                  padding: 20,
                  borderRadius: 16,
                  border:
                    '1px solid rgba(70,210,125,0.3)',
                  background:
                    'rgba(70,210,125,0.07)',
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color:
                      'rgba(255,255,255,0.55)',
                    marginBottom: 10,
                  }}
                >
                  رابط موقعك
                </div>

                <a
                  href={deploymentUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: '#7fb1ff',
                    fontSize: 17,
                    wordBreak: 'break-all',
                    textDecoration: 'none',
                  }}
                >
                  {deploymentUrl}
                </a>
              </div>
            )}

          {state === 'error' && (
            <button
              type="button"
              onClick={onBack}
              style={{
                marginTop: 28,
                padding: '12px 20px',
                borderRadius: 12,
                border:
                  '1px solid rgba(255,255,255,0.15)',
                background: 'transparent',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              العودة
            </button>
          )}
        </div>
      </section>
    </main>
  )
}

export default PreparingPage
