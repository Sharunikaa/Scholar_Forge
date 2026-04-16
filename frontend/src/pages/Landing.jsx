export default function Landing({ onOpenApp }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 60px',
        background: '#ffffff',
        borderBottom: '1px solid #ede8e3',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', fontWeight: '700' }}>
          <span style={{ fontSize: '24px' }}>🔬</span>
          <span style={{ background: 'linear-gradient(135deg, #0F7470 0%, #1a9a94 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            ArXivIQ
          </span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button
            onClick={onOpenApp}
            style={{
              background: 'linear-gradient(135deg, #0F7470 0%, #148080 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 2px 8px rgba(15, 116, 112, 0.2)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 4px 16px rgba(15, 116, 112, 0.3)'
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 2px 8px rgba(15, 116, 112, 0.2)'
            }}
          >
            Launch App →
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '100px 60px',
        background: 'linear-gradient(135deg, rgba(15, 116, 112, 0.08) 0%, rgba(184, 134, 11, 0.05) 100%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.3, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(15, 116, 112, 0.1), transparent 50%), radial-gradient(circle at 80% 50%, rgba(184, 134, 11, 0.1), transparent 50%)' }} />
        
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(15, 116, 112, 0.12)',
            color: '#0F7470',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '700',
            marginBottom: '24px',
            letterSpacing: '0.5px'
          }}>
            🚀 AI-POWERED RESEARCH ENGINE
          </div>
          
          <h1 style={{
            fontSize: '64px',
            fontWeight: '800',
            marginBottom: '24px',
            fontFamily: "'Instrument Serif', Georgia, serif",
            lineHeight: '1.2',
            color: '#1A1814'
          }}>
            Research Intelligence at Scale
          </h1>
          
          <p style={{
            fontSize: '20px',
            color: '#6b6360',
            marginBottom: '48px',
            maxWidth: '720px',
            margin: '0 auto 48px',
            lineHeight: '1.7'
          }}>
            Submit any research question. Our AI agents instantly search academic papers, the web, and PDFs in parallel—synthesizing findings into structured, cited reports in minutes.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onOpenApp}
              style={{
                background: 'linear-gradient(135deg, #0F7470 0%, #148080 100%)',
                color: 'white',
                border: 'none',
                padding: '16px 40px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '700',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 16px rgba(15, 116, 112, 0.25)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-3px)'
                e.target.style.boxShadow = '0 8px 24px rgba(15, 116, 112, 0.35)'
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 16px rgba(15, 116, 112, 0.25)'
              }}
            >
              Start Free Research
            </button>
            <button
              style={{
                background: 'transparent',
                color: '#0F7470',
                border: '2px solid #0F7470',
                padding: '14px 38px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '700',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#f0fffe'
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent'
              }}
            >
              Watch Demo
            </button>
          </div>

          <p style={{ marginTop: '32px', fontSize: '13px', color: '#9a8f85' }}>
            ✓ No credit card required  ✓ Instant results  ✓ Citation-ready reports
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section style={{
        padding: '80px 60px',
        background: '#f9f8f6',
        borderBottom: '1px solid #ede8e3'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '44px',
            fontWeight: '800',
            marginBottom: '16px',
            fontFamily: "'Instrument Serif', Georgia, serif",
            textAlign: 'center',
            color: '#1A1814'
          }}>
            Four Steps to Comprehensive Research
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b6360',
            textAlign: 'center',
            marginBottom: '60px',
            maxWidth: '600px',
            margin: '0 auto 60px'
          }}>
            From question to cited report in minutes, powered by parallel AI agents
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '32px'
          }}>
            {[
              { num: 1, icon: '✍️', title: 'Ask', desc: 'Submit your research question in plain language. Be as specific as needed.' },
              { num: 2, icon: '🔍', title: 'Search', desc: 'Five parallel agents simultaneously search arXiv, web sources, and PDF databases.' },
              { num: 3, icon: '⚡', title: 'Synthesize', desc: 'AI agents aggregate findings, then a critic validates claims for accuracy.' },
              { num: 4, icon: '📄', title: 'Export', desc: 'Download your report as DOCX/PDF with real citations and summaries.' }
            ].map((step) => (
              <div key={step.num} style={{
                background: '#ffffff',
                padding: '32px 28px',
                borderRadius: '12px',
                border: '1px solid #ede8e3',
                transition: 'all 0.3s',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #0F7470, #148080)'
                }} />
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(15, 116, 112, 0.15), rgba(20, 128, 128, 0.15))',
                  fontSize: '24px',
                  marginBottom: '16px'
                }}>
                  {step.icon}
                </div>
                
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: '#1A1814' }}>
                  {step.num}. {step.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b6360', lineHeight: '1.6' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Flow */}
      <section style={{
        padding: '80px 60px',
        background: '#f9f8f6',
        borderBottom: '1px solid #ede8e3'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '44px',
            fontWeight: '800',
            marginBottom: '16px',
            fontFamily: "'Instrument Serif', Georgia, serif",
            textAlign: 'center',
            color: '#1A1814'
          }}>
            Intelligent Agent Workflow
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b6360',
            textAlign: 'center',
            marginBottom: '60px',
            maxWidth: '700px',
            margin: '0 auto 60px'
          }}>
            Seven specialized AI agents work in parallel and sequence to gather, analyze, and synthesize research
          </p>

          {/* Main Agent Flow Diagram */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #ede8e3',
            borderRadius: '16px',
            padding: '48px 40px',
            marginBottom: '40px',
            overflow: 'auto'
          }}>
            {/* Flow Container */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              minWidth: '100%',
              overflowX: 'auto',
              paddingBottom: '20px'
            }}>
              {/* Agent 1: Planner */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '140px' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(15, 116, 112, 0.2), rgba(20, 128, 128, 0.2))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  marginBottom: '12px',
                  border: '2px solid #0F7470'
                }}>
                  🧠
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1A1814', textAlign: 'center', marginBottom: '4px' }}>
                  Planner
                </div>
                <div style={{ fontSize: '11px', color: '#6b6360', textAlign: 'center' }}>
                  Analyze & Plan
                </div>
              </div>

              {/* Arrow */}
              <div style={{ fontSize: '24px', color: '#0F7470', marginBottom: '50px' }}>→</div>

              {/* Agent 2 & 3: Parallel Search */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '140px' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(184, 134, 11, 0.2), rgba(200, 150, 30, 0.2))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  marginBottom: '12px',
                  border: '2px solid #B8860B'
                }}>
                  🔍
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1A1814', textAlign: 'center', marginBottom: '4px' }}>
                  Web Search
                </div>
                <div style={{ fontSize: '11px', color: '#6b6360', textAlign: 'center' }}>
                  Internet sources
                </div>
              </div>

              {/* Arrow */}
              <div style={{ fontSize: '24px', color: '#0F7470', marginBottom: '50px' }}>→</div>

              {/* Agent 3: ArXiv */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '140px' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(200, 150, 30, 0.2), rgba(184, 134, 11, 0.2))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  marginBottom: '12px',
                  border: '2px solid #C8961E'
                }}>
                  📚
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1A1814', textAlign: 'center', marginBottom: '4px' }}>
                  ArXiv Search
                </div>
                <div style={{ fontSize: '11px', color: '#6b6360', textAlign: 'center' }}>
                  Academic papers
                </div>
              </div>

              {/* Arrow */}
              <div style={{ fontSize: '24px', color: '#0F7470', marginBottom: '50px' }}>→</div>

              {/* Agent 4: PDF Download */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '140px' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(184, 134, 11, 0.2), rgba(200, 150, 30, 0.2))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  marginBottom: '12px',
                  border: '2px solid #D4941A'
                }}>
                  📄
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1A1814', textAlign: 'center', marginBottom: '4px' }}>
                  PDF Download
                </div>
                <div style={{ fontSize: '11px', color: '#6b6360', textAlign: 'center' }}>
                  Extract content
                </div>
              </div>

              {/* Arrow */}
              <div style={{ fontSize: '24px', color: '#0F7470', marginBottom: '50px' }}>→</div>

              {/* Agent 5: Summarizer */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '140px' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(184, 134, 11, 0.2), rgba(200, 150, 30, 0.2))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  marginBottom: '12px',
                  border: '2px solid #D4941A'
                }}>
                  📝
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1A1814', textAlign: 'center', marginBottom: '4px' }}>
                  Summarizer
                </div>
                <div style={{ fontSize: '11px', color: '#6b6360', textAlign: 'center' }}>
                  Condense findings
                </div>
              </div>

              {/* Arrow */}
              <div style={{ fontSize: '24px', color: '#0F7470', marginBottom: '50px' }}>→</div>

              {/* Agent 6: Writer */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '140px' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(184, 134, 11, 0.2), rgba(200, 150, 30, 0.2))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  marginBottom: '12px',
                  border: '2px solid #D4941A'
                }}>
                  ✍️
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1A1814', textAlign: 'center', marginBottom: '4px' }}>
                  Writer
                </div>
                <div style={{ fontSize: '11px', color: '#6b6360', textAlign: 'center' }}>
                  Generate report
                </div>
              </div>

              {/* Arrow */}
              <div style={{ fontSize: '24px', color: '#0F7470', marginBottom: '50px' }}>→</div>

              {/* Agent 7: Critic */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '140px' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(15, 116, 112, 0.2), rgba(20, 128, 128, 0.2))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  marginBottom: '12px',
                  border: '2px solid #0F7470'
                }}>
                  ⚖️
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1A1814', textAlign: 'center', marginBottom: '4px' }}>
                  Critic
                </div>
                <div style={{ fontSize: '11px', color: '#6b6360', textAlign: 'center' }}>
                  Validate Quality
                </div>
              </div>
            </div>
          </div>

          {/* Agent Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {[
              { icon: '🧠', name: 'Planner', desc: 'Analyzes your question and creates an optimal research strategy', time: '0.8s' },
              { icon: '🔍', name: 'Web Search', desc: 'Searches current web sources and news for latest findings', time: '3.0s' },
              { icon: '📚', name: 'ArXiv Search', desc: 'Queries academic database for peer-reviewed papers', time: '2.5s' },
              { icon: '📄', name: 'PDF Extractor', desc: 'Downloads and processes full-text PDFs', time: '5.0s' },
              { icon: '📝', name: 'Summarizer', desc: 'Creates concise summaries from each source', time: '3.5s' },
              { icon: '✍️', name: 'Writer', desc: 'Synthesizes all findings into structured report', time: '4.0s' },
              { icon: '⚖️', name: 'Critic', desc: 'Validates claims, checks citations, ensures accuracy', time: '2.0s' },
              { icon: '💾', name: 'Export', desc: 'Generates DOCX/PDF with proper formatting & citations', time: '1.0s' }
            ].map((agent) => (
              <div key={agent.name} style={{
                background: '#ffffff',
                border: '1px solid #ede8e3',
                borderRadius: '12px',
                padding: '24px',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              >
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>
                  {agent.icon}
                </div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#1A1814', marginBottom: '8px' }}>
                  {agent.name}
                </div>
                <p style={{ fontSize: '13px', color: '#6b6360', marginBottom: '12px', lineHeight: '1.5' }}>
                  {agent.desc}
                </p>
                <div style={{ fontSize: '12px', color: '#0F7470', fontWeight: '700' }}>
                  ⏱️ {agent.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section style={{
        padding: '80px 60px',
        background: '#ffffff'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '44px',
            fontWeight: '800',
            marginBottom: '16px',
            fontFamily: "'Instrument Serif', Georgia, serif",
            textAlign: 'center',
            color: '#1A1814'
          }}>
            Powerful Features
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b6360',
            textAlign: 'center',
            marginBottom: '60px',
            maxWidth: '600px',
            margin: '0 auto 60px'
          }}>
            Everything you need for professional research and citations
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '28px'
          }}>
            {[
              { icon: '🔗', title: 'Real Citations', desc: 'Automatic citation formatting in APA, MLA, Chicago, IEEE, and more.' },
              { icon: '📚', title: 'PDF Extraction', desc: 'Download and analyze full academic papers with intelligent extraction.' },
              { icon: '⚖️', title: 'Accuracy Validation', desc: 'AI critic reviews findings for verifiable claims and logical consistency.' },
              { icon: '🌐', title: 'Web + Academic', desc: 'Unified search across arXiv papers, web sources, and institutional databases.' },
              { icon: '🗂️', title: 'Session Management', desc: 'Track research history, iterate on queries, and manage multiple projects.' },
              { icon: '⚡', title: 'Instant Export', desc: 'Download reports as formatted Word documents or PDFs ready to share.' }
            ].map((feature, idx) => (
              <div key={idx} style={{
                background: '#f9f8f6',
                padding: '28px',
                borderRadius: '12px',
                border: '1px solid #ede8e3',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#ffffff'
                e.currentTarget.style.borderColor = '#0F7470'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#f9f8f6'
                e.currentTarget.style.borderColor = '#ede8e3'
              }}
              >
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '10px', color: '#1A1814' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b6360', lineHeight: '1.6' }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section style={{
        padding: '80px 60px',
        background: 'linear-gradient(135deg, rgba(15, 116, 112, 0.06) 0%, rgba(184, 134, 11, 0.04) 100%)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '44px',
            fontWeight: '800',
            marginBottom: '60px',
            fontFamily: "'Instrument Serif', Georgia, serif",
            textAlign: 'center',
            color: '#1A1814'
          }}>
            Perfect For
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px'
          }}>
            {[
              { emoji: '👨‍🎓', title: 'Students', desc: 'Quick research for papers and projects with proper citations.' },
              { emoji: '🔬', title: 'Researchers', desc: 'Literature reviews and cross-domain synthesis at scale.' },
              { emoji: '💼', title: 'Professionals', desc: 'Industry insights, competitive analysis, and market research.' },
              { emoji: '📊', title: 'Analysts', desc: 'Data synthesis and multi-source aggregation in minutes.' }
            ].map((useCase, idx) => (
              <div key={idx} style={{
                textAlign: 'center',
                padding: '32px 24px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{useCase.emoji}</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#1A1814' }}>
                  {useCase.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b6360', lineHeight: '1.6' }}>
                  {useCase.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        padding: '80px 60px',
        background: 'linear-gradient(135deg, #0F7470 0%, #148080 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '800',
            marginBottom: '24px',
            fontFamily: "'Instrument Serif', Georgia, serif"
          }}>
            Start Your Research Now
          </h2>
          <p style={{
            fontSize: '18px',
            marginBottom: '40px',
            lineHeight: '1.7',
            opacity: 0.95
          }}>
            Experience the future of research. No credit card, no installation, no setup. Just ask and get comprehensive, cited results.
          </p>
          <button
            onClick={onOpenApp}
            style={{
              background: '#B8860B',
              color: '#1A1814',
              border: 'none',
              padding: '16px 44px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '700',
              transition: 'all 0.2s',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-3px)'
              e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)'
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'
            }}
          >
            Launch ArXivIQ Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px 60px',
        background: '#1A1814',
        color: '#9a8f85',
        textAlign: 'center',
        fontSize: '13px',
        borderTop: '1px solid #2a2520'
      }}>
        <p>© 2024 ArXivIQ. Powered by advanced AI agents and LangGraph. Research intelligence made accessible.</p>
      </footer>
    </div>
  )
}
