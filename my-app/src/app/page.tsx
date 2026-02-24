import Script from 'next/script';
import './soltio.css';
import Link from 'next/link';
import { CountUp } from './components/CountUp';
import { AnimatedDonut } from './components/AnimatedDonut';
import { LiveVerification } from './components/LiveVerification';
import { AnimatedBarChart } from './components/AnimatedBarChart';

export default function Home() {
    return (
        <div className="bg-[#020617] text-white min-h-screen">
            <Script src="/script.js" strategy="afterInteractive" />

            <div className="background-radial">
                <div className="radial-ring circle-1"></div>
                <div className="radial-ring circle-2"></div>
                <div className="glow-purple"></div>
                <div className="glow-blue"></div>
                <div className="sparkle sp-1">✦</div>
                <div className="sparkle sp-2">✦</div>
            </div>

            <nav className="navbar">
                <div className="logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23 4L14 13L9 8L1 16" stroke="white" strokeWidth="2" strokeLinecap="round"
                            strokeLinejoin="round" />
                        <path d="M17 4H23V10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="logo-text">Soltio</span>
                </div>
                <div className="nav-links">
                    <a href="#home">Home <span className="arrow-down">▾</span></a>
                    <a href="#features">Features <span className="arrow-down">▾</span></a>
                    <a href="#analytics">Analytics <span className="arrow-down">▾</span></a>
                    <a href="#pricing">Pricing <span className="arrow-down">▾</span></a>
                    <a href="#contact">Contact <span className="arrow-down">▾</span></a>
                </div>
                <div className="nav-right">
                    <a href="/dashboard">
                        <button className="btn-primary cursor-pointer">Get started now <span className="arrow-up-right">↗</span></button>
                    </a>
                </div>
            </nav>

            <main className="hero" id="home">
                <div className="hero-content">
                    <div className="tag-floating tag-blue">Feature!</div>
                    <h1 className="hero-title">Smart finance tools for<br />smarter decisions</h1>
                    <p className="hero-subtitle">Frame community undo rotate blur Flatten rotate pixel clip prototype underline fill
                        list effect Plugin clip export arrange export component Vertical style horizontal.</p>

                    <div className="tag-floating tag-orange">Update</div>
                </div>

                <div className="showcase-area" id="showcase">

                    <div className="card-float center-card" data-speed="2">
                        <div className="glass-panel reward-card tilt-element">
                            <div className="rc-header">
                                <span>Reward Card</span>
                                <svg className="wifi-icon" width="20" height="20" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2">
                                    <path
                                        d="M5 12.55a11 11 0 0 1 14.08 0 M1.42 9a16 16 0 0 1 21.16 0 M8.53 16.11a6 6 0 0 1 6.95 0">
                                    </path>
                                </svg>
                            </div>
                            <div className="rc-chip"></div>
                            <div className="rc-number">1234 5678 9123 4567</div>
                            <div className="rc-footer">
                                <div className="rc-name">John Smith</div>
                                <div className="rc-date">09/25</div>
                            </div>
                        </div>
                    </div>


                    <div className="card-float tl-card" data-speed="5">
                        <LiveVerification />
                    </div>

                    <div className="card-float tl-card-2" data-speed="-3">
                        <div className="glass-panel square-icon tilt-element">
                            <div className="hands-icon">💸</div>
                        </div>
                    </div>

                    <div className="card-float bl-card" data-speed="4">
                        <div className="glass-panel stat-box tilt-element light-theme">
                            <div className="stat-label">Income</div>
                            <div className="stat-val-row">
                                <h3 className="stat-value">$<CountUp end={2950} decimals={2} /></h3>
                                <span className="badge badge-green">↑ <CountUp end={8.2} decimals={2} />%</span>
                            </div>
                            <div className="progress-track">
                                <div className="progress-fill" style={{ width: "59%" }}>
                                    <span className="progress-text">59%</span>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="card-float tr-card" data-speed="-4">
                        <div className="glass-panel stat-box tilt-element light-theme">
                            <div className="stat-label">Weekly Revenue</div>
                            <div className="stat-val-row">
                                <h3 className="stat-value">$<CountUp end={2464} /> USD</h3>
                                <span className="badge badge-green">+<CountUp end={12} />%</span>
                            </div>
                        </div>
                    </div>

                    <div className="card-float br-card" data-speed="3">
                        <div className="glass-panel stat-box tilt-element light-theme">
                            <div className="stat-label">Available Balance</div>
                            <h3 className="stat-value-large">$<CountUp end={45234} /></h3>
                            <div className="dual-stats">
                                <div className="micro-stat">
                                    <div className="micro-icon down-blue">↓</div>
                                    <div className="micro-text">
                                        <span className="label">Income</span>
                                        <span className="val">$<CountUp end={48000} /></span>
                                    </div>
                                </div>
                                <div className="micro-stat">
                                    <div className="micro-icon up-blue">↑</div>
                                    <div className="micro-text">
                                        <span className="label">Expenses</span>
                                        <span className="val">$<CountUp end={2356} /></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="trusted-section">
                    <p>Trusted by 15,000+ founders & business owners</p>
                    <div className="logo-row">
                        <span className="partner-logo">● Logo Ipsum</span>
                        <span className="partner-logo">◎ Dummy Logo</span>
                        <span className="partner-logo">❖ Digital Dummy</span>
                        <span className="partner-logo">✺ Logo Text</span>
                        <span className="partner-logo">◀ Brand Name ▶</span>
                    </div>
                </div>


                <section id="features" className="feature-section left-image pt-100">
                    <div className="feature-image-container perspective-container">
                        <div className="glass-panel phone-mockup dark-theme">
                            <div className="phone-header">
                                <span className="back-arrow">‹</span>
                                <span>Expenses</span>
                                <span className="plus-icon">+</span>
                            </div>
                            <div className="phone-date">September 2026 <span className="arrow-down-small">▾</span></div>
                            <h2 className="phone-balance">$<CountUp end={1812} /></h2>

                            <div className="budget-row">
                                <div className="b-col">
                                    <div className="b-label">Left to spend</div>
                                    <div className="b-val">$<CountUp end={738} /></div>
                                </div>
                                <div className="b-col right">
                                    <div className="b-label">Monthly budget</div>
                                    <div className="b-val">$<CountUp end={2550} /></div>
                                </div>
                            </div>
                            <div className="budget-bar">
                                <div className="b-fill gradient-1" style={{ width: "30%" }}></div>
                                <div className="b-fill gradient-2" style={{ width: "20%" }}></div>
                                <div className="b-fill gradient-3" style={{ width: "20%" }}></div>
                            </div>

                            <div className="expense-list">
                                <div className="expense-item">
                                    <div className="ei-icon default-icon blue-bg">🚗</div>
                                    <div className="ei-details">
                                        <span className="ei-title">Auto & transport</span>
                                        <span className="ei-amount">$<CountUp end={700} /></span>
                                    </div>
                                </div>
                                <div className="expense-item">
                                    <div className="ei-icon default-icon orange-bg">🛡️</div>
                                    <div className="ei-details">
                                        <span className="ei-title">Auto insurance</span>
                                        <span className="ei-amount">$<CountUp end={250} /></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel card-float-mockup black-card" data-speed="4">
                            <div className="card-chip gold-chip"></div>
                            <div className="card-num small-num">**** **** **** 3090</div>
                            <div className="signature">Soltio</div>
                        </div>
                    </div>

                    <div className="feature-content">
                        <h2 className="feature-title">Empowering your<br />financial future today</h2>
                        <p className="feature-desc">Lorem ipsum dolor sit amet consectetur Amet ullamcorper atsit eros risus eget
                            tristique diam imperdiet. Eleifend et porttitor amet.</p>

                        <a href="#" className="feature-link">real-time transaction tracking <span className="arrow-right">→</span></a>
                        <p className="feature-desc small">Lorem ipsum dolor sit amet consectetur Molestie ullamcorper elit non diam
                            at pharetra integer non fringilla. Non cras sapien rutrum Maecenas tellus posuere faucibus
                            tincidunt.</p>

                        <div className="feature-grid mt-40">
                            <div className="feature-box">
                                <div className="grid-icon black-bg">💳</div>
                                <p>Monitor payments<br />in real-time</p>
                            </div>
                            <div className="feature-box">
                                <div className="grid-icon black-bg">🔔</div>
                                <p>Instant alerts for<br />transaction</p>
                            </div>
                        </div>
                    </div>
                </section>


                <section className="feature-section right-image pt-100">
                    <div className="feature-content">
                        <h2 className="feature-title">Easily transfer money across borders and reach anyone, anywhere in the world
                            in minutes.</h2>
                        <p className="feature-desc">Lorem ipsum dolor sit amet consectetur Molestie ullamcorper elit non diam at
                            pharetra integer non fringilla Non cras</p>

                        <button className="btn-primary mt-20">Start free trial <span className="arrow-up-right">↗</span></button>

                        <div className="rating-box mt-40">
                            <div className="avatars">
                                <div className="avatar av-1"></div>
                                <div className="avatar av-2"></div>
                                <div className="avatar av-3"></div>
                            </div>
                            <div className="rating-text">
                                <div className="stars">★★★★★</div>
                                <p>Rated 4.9/5 from over 600 review</p>
                            </div>
                        </div>
                    </div>

                    <div className="feature-image-container perspective-container">
                        <div className="glass-panel transfer-form light-theme">
                            <h3>Bank transfer</h3>

                            <div className="form-group mt-20">
                                <label>Select Destination Country</label>
                                <div className="input-box select-box">Location <span className="arrow-down-small">▾</span></div>
                            </div>

                            <div className="form-group">
                                <label>You Send</label>
                                <div className="input-box split-box">
                                    <span className="val-text">11,400,349</span>
                                    <span className="currency">USD</span>
                                </div>
                            </div>

                            <div className="transfer-details">
                                <div className="detail-row"><span>Rate</span><span>11,400,349</span></div>
                                <div className="detail-row"><span>Fee</span><span>USD 100,000</span></div>
                            </div>

                            <div className="form-group">
                                <label>Recipient Gets Exactly</label>
                                <div className="input-box split-box gray-bg">
                                    <span className="val-text">1,000</span>
                                    <span className="currency">USD</span>
                                </div>
                            </div>

                            <button className="btn-primary full-width mt-20 black-btn">Send now</button>
                        </div>
                    </div>
                </section>


                <section className="feature-section center-aligned pt-100">
                    <h2 className="feature-title text-center">Secure payments simplified for your<br />everyday financial needs</h2>

                    <div className="bento-grid mt-60">

                        <div className="glass-panel bento-card light-theme">
                            <div className="bento-header">
                                <span className="bento-label">Available Amount</span>
                                <span className="dots">•••</span>
                            </div>
                            <h3 className="bento-value">$<CountUp end={24178.25} decimals={2} /></h3>

                            <div className="stats-grid mt-40">
                                <div className="stat-item">
                                    <div className="circle-icon border-blue"></div>
                                    <div className="stat-info">
                                        <span className="s-label">Card Balance</span>
                                        <span className="s-val">$<CountUp end={24178.25} decimals={2} /></span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <div className="circle-icon border-blue-light"></div>
                                    <div className="stat-info">
                                        <span className="s-label">Card Limit</span>
                                        <span className="s-val">$<CountUp end={10028.00} decimals={2} /></span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <div className="circle-icon border-purple"></div>
                                    <div className="stat-info">
                                        <span className="s-label">Card Balance</span>
                                        <span className="s-val">$<CountUp end={48153.00} decimals={2} /></span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <div className="circle-icon border-purple-light"></div>
                                    <div className="stat-info">
                                        <span className="s-label">Cashback</span>
                                        <span className="s-val">$<CountUp end={12062.25} decimals={2} /></span>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="glass-panel bento-card light-theme flex-column-between">
                            <div className="reward-card floating-small purple-gradient card-float" data-speed="2">
                                <div className="rc-header"><span>Reward Card</span>
                                    <div className="rc-chip small-chip"></div>
                                </div>
                                <div className="rc-number small-text mt-40">1234 5678 9123 4567</div>
                                <div className="rc-footer">
                                    <div className="rc-name">John Smith</div>
                                </div>
                            </div>

                            <div className="card-content-bottom mt-100">
                                <h3 className="bento-title">Effortless<br />financial freedom</h3>
                                <p className="bento-desc mt-10">Connection duplicate hand union fill subtract main content blur.
                                    Pixel asset team create resizing.</p>
                                <a href="/dashboard">
                                    <button className="btn-primary black-btn mt-20 cursor-pointer">Get started now <span
                                        className="arrow-up-right white-arrow">↗</span></button>
                                </a>
                            </div>
                        </div>


                        <div className="glass-panel bento-card light-theme row-card">
                            <div className="donut-chart-box">
                                <AnimatedDonut percentage={71} />
                            </div>
                            <div className="chart-info">
                                <h3 className="bento-title">Balance your<br />expenses</h3>
                                <p className="bento-desc mt-10">Layer vertical star vertical text bullet Invite star.</p>
                                <h2 className="chart-big-val mt-20"><CountUp end={100} />%</h2>
                            </div>
                        </div>
                    </div>
                </section>


                <section id="analytics" className="feature-section left-image pt-100 dark-bg-block">
                    <div className="feature-image-container perspective-container">

                        <div className="glass-panel top-floating-panel light-green-bg card-float" data-speed="3">
                            <div className="tp-label">Available Amount</div>
                            <div className="tp-val">$<CountUp end={24178.25} decimals={2} /></div>
                            <div className="tp-actions">
                                <div className="tp-btn">↑<br /><span>Send</span></div>
                                <div className="tp-btn">↓<br /><span>Received</span></div>
                                <div className="tp-btn">⇅<br /><span>Convert</span></div>
                            </div>
                        </div>


                        <div className="glass-panel chart-panel dark-theme">
                            <AnimatedBarChart />
                        </div>
                    </div>

                    <div className="feature-content">
                        <h2 className="feature-title">Comprehensive financial<br />analytics dashboard</h2>
                        <p className="feature-desc mt-20">Bold overflow background figma object prototype reesizing Invite align
                            ipsum community distribute style Frame</p>

                        <ul className="feature-list mt-40">
                            <li><span className="check-circle">✓</span> Keep Tracking Balance</li>
                            <li><span className="check-circle">✓</span> Send Money Easily</li>
                            <li><span className="check-circle">✓</span> Received Money Easily</li>
                            <li><span className="check-circle">✓</span> Convert Currency</li>
                        </ul>
                    </div>
                </section>

                {/* Section 5: Pricing Section */}
                <section id="pricing" className="feature-section center-aligned pt-100">
                    <h2 className="feature-title text-center">Simple, transparent pricing</h2>
                    <p className="feature-desc text-center mt-20">No hidden fees or unexpected charges. Choose the plan that fits your business.</p>

                    <div className="pricing-grid mt-60">
                        {/* Basic Plan */}
                        <div className="glass-panel pricing-card light-theme">
                            <h3 className="plan-name">Starter</h3>
                            <div className="plan-price">Free</div>
                            <p className="plan-desc mt-10">For individuals starting out.</p>
                            <ul className="plan-features mt-20">
                                <li><span className="check-circle">✓</span> Up to $10,000 monthly volume</li>
                                <li><span className="check-circle">✓</span> Standard support</li>
                                <li><span className="check-circle">✓</span> Basic analytics</li>
                            </ul>
                            <button className="btn-secondary full-width mt-40">Get Started</button>
                        </div>
                        {/* Pro Plan */}
                        <div className="glass-panel pricing-card dark-theme highlight-card">
                            <div className="tag-floating tag-orange" style={{ top: "-15px", right: "20px" }}>Popular</div>
                            <h3 className="plan-name">Professional</h3>
                            <div className="plan-price">$29<span className="month">/mo</span></div>
                            <p className="plan-desc mt-10">For growing businesses.</p>
                            <ul className="plan-features mt-20">
                                <li><span className="check-circle">✓</span> Unlimited monthly volume</li>
                                <li><span className="check-circle">✓</span> 24/7 Priority support</li>
                                <li><span className="check-circle">✓</span> Advanced analytics</li>
                                <li><span className="check-circle">✓</span> API Access</li>
                            </ul>
                            <button className="btn-primary full-width mt-40 cursor-pointer">Get Started</button>
                        </div>
                    </div>
                </section>

                {/* Footer / Contact */}
                <footer id="contact" className="footer pt-100">
                    <div className="footer-content">
                        <h2 className="feature-title text-center">Ready to get started?</h2>
                        <div className="flex-center mt-40">
                            <button className="btn-primary cursor-pointer">Contact Sales</button>
                        </div>
                    </div>
                </footer>
            </main>



        </div>
    );
}