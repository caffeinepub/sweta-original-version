import { useEffect, useRef, useState } from 'react';
import { Heart, Music, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Section = 'hero' | 'story' | 'special' | 'letter' | 'forever';

interface Butterfly {
  id: number;
  x: number;
  y: number;
  type: number;
}

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFloatingHearts, setShowFloatingHearts] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [currentSection, setCurrentSection] = useState<Section>('hero');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [butterflies, setButterflies] = useState<Butterfly[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const butterflyIdRef = useRef(0);
  const sectionsRef = useRef<{ [key in Section]: HTMLElement | null }>({
    hero: null,
    story: null,
    special: null,
    letter: null,
    forever: null,
  });

  useEffect(() => {
    // Trigger floating hearts on scroll
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowFloatingHearts(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click to spawn butterflies
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Don't spawn butterflies on button clicks or during popup
      if (showPopup || (e.target as HTMLElement).closest('button')) {
        return;
      }

      const newButterfly: Butterfly = {
        id: butterflyIdRef.current++,
        x: e.clientX,
        y: e.clientY,
        type: Math.floor(Math.random() * 3), // 3 butterfly types
      };

      setButterflies((prev) => [...prev, newButterfly]);

      // Remove butterfly after animation completes
      setTimeout(() => {
        setButterflies((prev) => prev.filter((b) => b.id !== newButterfly.id));
      }, 4000);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showPopup]);

  const handlePopupClick = () => {
    setShowPopup(false);
    // Start playing music after popup fades with volume fade-in
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.volume = 0;
        audioRef.current.play().catch(err => {
          console.log('Audio playback failed:', err);
        });
        setIsPlaying(true);
        
        // Fade in volume
        let volume = 0;
        const fadeIn = setInterval(() => {
          if (volume < 0.7) {
            volume += 0.05;
            if (audioRef.current) {
              audioRef.current.volume = Math.min(volume, 0.7);
            }
          } else {
            clearInterval(fadeIn);
          }
        }, 100);
      }
    }, 300);
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.log('Audio playback failed:', err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const navigateToSection = (section: Section) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Trigger page turn animation
    setTimeout(() => {
      setCurrentSection(section);
      const targetElement = sectionsRef.current[section];
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 400);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1200);
  };

  const getNextSection = (current: Section): Section | null => {
    const order: Section[] = ['hero', 'story', 'special', 'letter', 'forever'];
    const currentIndex = order.indexOf(current);
    return currentIndex < order.length - 1 ? order[currentIndex + 1] : null;
  };

  const nextSection = getNextSection(currentSection);

  const butterflyImages = [
    '/assets/generated/butterfly-pastel-transparent.dim_100x100.png',
    '/assets/generated/butterfly-cream-rose-transparent.dim_120x80.png',
    '/assets/generated/butterfly-purple-white-transparent.dim_80x80.png',
  ];

  return (
    <div className="romantic-page">
      {/* Page Turn Overlay */}
      {isTransitioning && (
        <div className="page-turn-overlay">
          <div className="page-turn-left"></div>
          <div className="page-turn-right"></div>
        </div>
      )}

      {/* Butterflies */}
      {butterflies.map((butterfly) => (
        <div
          key={butterfly.id}
          className="butterfly-container"
          style={{
            left: `${butterfly.x}px`,
            top: `${butterfly.y}px`,
          }}
        >
          <img
            src={butterflyImages[butterfly.type]}
            alt="Butterfly"
            className="butterfly-image"
          />
        </div>
      ))}

      {/* Popup Message */}
      {showPopup && (
        <div className="popup-overlay" onClick={handlePopupClick}>
          <div className="popup-content" onClick={handlePopupClick}>
            <div className="popup-heart-icon">
              <Heart className="popup-heart" fill="currentColor" />
            </div>
            <p className="popup-text">Click to play our song 💖</p>
            <div className="popup-music-icon">
              <Music className="popup-music" />
            </div>
          </div>
        </div>
      )}

      {/* Falling Petals Background with Parallax */}
      <div className="falling-petals">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="petal"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Floating Hearts on Scroll */}
      {showFloatingHearts && (
        <div className="floating-hearts">
          {[...Array(10)].map((_, i) => (
            <Heart
              key={i}
              className="floating-heart"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Music Control Button */}
      <Button
        onClick={toggleMusic}
        className="music-control"
        size="icon"
        variant="outline"
      >
        {isPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      </Button>

      {/* Hero Section */}
      <section 
        className={`hero-section section-container ${currentSection === 'hero' ? 'active' : ''}`}
        ref={(el) => { sectionsRef.current.hero = el; }}
      >
        <div className="hero-content fade-in">
          <div className="heart-animation">
            <Heart className="beating-heart" fill="currentColor" />
          </div>
          <h1 className="hero-title">My Love Sweta</h1>
          <p className="hero-subtitle">
            Every moment with you, my darling Sweta, is a beautiful dream come true
          </p>
          
          {/* Ghibli Portrait */}
          <div className="ghibli-portrait-container">
            <div className="ghibli-frame">
              <img
                src="/assets/generated/sweta-ghibli-portrait-1.dim_400x400.png"
                alt="Sweta"
                className="ghibli-portrait"
              />
              <div className="portrait-glow"></div>
            </div>
          </div>
          
          <img
            src="/assets/generated/floral-border-transparent.dim_1200x200.png"
            alt="Floral decoration"
            className="floral-divider"
          />
          
          {nextSection && (
            <Button
              onClick={() => navigateToSection('story')}
              className="next-button"
              size="lg"
            >
              Next
              <ChevronDown className="ml-2 h-5 w-5 animate-bounce" />
            </Button>
          )}
        </div>
      </section>

      {/* Our Love Story Section */}
      <section 
        className={`content-section section-container ${currentSection === 'story' ? 'active' : ''}`}
        ref={(el) => { sectionsRef.current.story = el; }}
      >
        <div className="container">
          <div className="card-romantic fade-in-up">
            <div className="card-header-romantic">
              <img
                src="/assets/generated/rose-pink.dim_400x400.png"
                alt="Rose"
                className="section-icon"
              />
              <h2 className="section-title">Our Love Story</h2>
            </div>
            <div className="card-content-romantic">
              {/* Ghibli Portrait with Cherry Blossom Backdrop */}
              <div className="story-portrait-container">
                <img
                  src="/assets/generated/cherry-blossom-transparent.dim_600x300.png"
                  alt="Cherry Blossoms"
                  className="cherry-blossom-backdrop"
                />
                <div className="ghibli-frame-inline">
                  <img
                    src="/assets/generated/sweta-ghibli-portrait-2.dim_400x400.png"
                    alt="Sweta"
                    className="ghibli-portrait-inline"
                  />
                  <div className="portrait-glow-inline"></div>
                </div>
              </div>
              
              <p className="romantic-text">
                On <span className="highlight">29 November</span>, our hearts
                intertwined and created a beautiful symphony of love. That magical day
                marked the beginning of our forever—the day I found my soulmate in you, Sweta. A journey filled with laughter,
                tenderness, and endless affection began.
              </p>
              <p className="romantic-text">
                From that moment, every sunrise has been brighter, every sunset more
                beautiful, and every heartbeat a reminder of how blessed I am to have
                you in my life, my precious Sweta.
              </p>
              
              <Button
                onClick={() => navigateToSection('special')}
                className="next-button mt-6"
                size="lg"
              >
                Next
                <ChevronDown className="ml-2 h-5 w-5 animate-bounce" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why She Is Special Section */}
      <section 
        className={`content-section section-container ${currentSection === 'special' ? 'active' : ''}`}
        ref={(el) => { sectionsRef.current.special = el; }}
      >
        <div className="container">
          <div className="card-romantic fade-in-up">
            <div className="card-header-romantic">
              <img
                src="/assets/generated/cherry-blossom-transparent.dim_600x300.png"
                alt="Cherry Blossom"
                className="section-icon"
              />
              <h2 className="section-title">Why Sweta Is My Everything</h2>
            </div>
            <div className="card-content-romantic">
              {/* Ghibli Portrait with Warm Pink Toning and Glowing Ambiance */}
              <div className="special-portrait-container">
                <div className="ghibli-frame-special">
                  <img
                    src="/assets/generated/sweta-ghibli-portrait-3.dim_400x400.png"
                    alt="Sweta"
                    className="ghibli-portrait-special"
                  />
                  <div className="portrait-glow-special"></div>
                  <img
                    src="/assets/generated/heart-glow-transparent.dim_200x200.png"
                    alt="Heart Glow"
                    className="heart-glow-accent"
                  />
                </div>
              </div>
              
              <div className="reasons-grid">
                <div className="reason-card">
                  <Heart className="reason-icon" fill="currentColor" />
                  <h3 className="reason-title">Your Radiant Smile</h3>
                  <p className="reason-text">
                    Sweta's smile lights up my darkest days and fills my world with
                    warmth. It's the most beautiful sight I've ever witnessed.
                  </p>
                </div>
                <div className="reason-card">
                  <Heart className="reason-icon" fill="currentColor" />
                  <h3 className="reason-title">Your Gentle Heart</h3>
                  <p className="reason-text">
                    Your kindness and compassion inspire me every day. You see beauty
                    in everything and spread love wherever you go, my sweet Sweta.
                  </p>
                </div>
                <div className="reason-card">
                  <Heart className="reason-icon" fill="currentColor" />
                  <h3 className="reason-title">Your Unwavering Support</h3>
                  <p className="reason-text">
                    You believe in me even when I doubt myself. Your encouragement
                    gives me strength to chase my dreams.
                  </p>
                </div>
                <div className="reason-card">
                  <Heart className="reason-icon" fill="currentColor" />
                  <h3 className="reason-title">Your Beautiful Soul</h3>
                  <p className="reason-text">
                    Beyond your outer beauty lies a soul so pure and loving. You make
                    me want to be a better person every single day.
                  </p>
                </div>
              </div>
              
              <Button
                onClick={() => navigateToSection('letter')}
                className="next-button mt-6"
                size="lg"
              >
                Next
                <ChevronDown className="ml-2 h-5 w-5 animate-bounce" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Love Letter Section */}
      <section 
        className={`content-section section-container ${currentSection === 'letter' ? 'active' : ''}`}
        ref={(el) => { sectionsRef.current.letter = el; }}
      >
        <div className="container">
          <div className="card-romantic love-letter fade-in-up">
            <div className="card-header-romantic">
              <img
                src="/assets/generated/heart-glow-transparent.dim_200x200.png"
                alt="Glowing Heart"
                className="section-icon"
              />
              <h2 className="section-title">A Letter From My Heart</h2>
            </div>
            <div className="card-content-romantic">
              <div className="letter-content">
                <p className="letter-text">My Dearest Sweta,</p>
                <p className="letter-text">
                  Words cannot fully express the depth of my feelings for you, but I
                  will try. You are the melody that plays in my heart, the sunshine
                  that brightens my mornings, and the star that guides me through the
                  night.
                </p>
                <p className="letter-text">
                  Every day with you is a gift I cherish, Sweta. Your laughter is my favorite
                  sound, your happiness my greatest achievement, and your love my most
                  precious treasure. You've taught me what it means to truly love and
                  be loved in return.
                </p>
                <p className="letter-text">
                  When I look into your eyes, I see our future together—filled with
                  adventures, quiet moments, shared dreams, and endless love. You are
                  my best friend, my confidant, my inspiration, and my home.
                </p>
                <p className="letter-text">
                  Thank you for choosing me, for loving me, and for being the most
                  incredible person I've ever known. I promise to love you with all my
                  heart, to support your dreams, to make you smile, and to stand by
                  your side through every season of life.
                </p>
                <p className="letter-text">
                  You are my today and all of my tomorrows, Sweta. I love you more than words
                  can say, more than actions can show, and more than you'll ever know.
                </p>
                <p className="letter-signature">
                  Forever Yours ❤️
                  <br />
                  <span className="signature-name">Your Loving Boyfriend</span>
                </p>
              </div>
              
              <Button
                onClick={() => navigateToSection('forever')}
                className="next-button mt-6"
                size="lg"
              >
                Next
                <ChevronDown className="ml-2 h-5 w-5 animate-bounce" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Ending Section */}
      <section 
        className={`ending-section section-container ${currentSection === 'forever' ? 'active' : ''}`}
        ref={(el) => { sectionsRef.current.forever = el; }}
      >
        <div className="ending-content fade-in">
          <Heart className="ending-heart" fill="currentColor" />
          <h2 className="ending-title">Forever Yours, Sweta ❤️</h2>
          <p className="ending-text">
            Until the stars fade and the oceans run dry, my love for you will never
            die.
          </p>
          <img
            src="/assets/generated/floral-border-transparent.dim_1200x200.png"
            alt="Floral decoration"
            className="floral-divider"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="romantic-footer">
        <p className="footer-text">
          © 2025. Built with <Heart className="inline-heart" fill="currentColor" />{' '}
          using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* Audio Element with Smooth Emotional Instrumental Love Song */}
      <audio ref={audioRef} loop>
        {/* Royalty-free smooth emotional instrumental with soft strings and piano */}
        <source src="https://cdn.pixabay.com/audio/2022/03/10/audio_4a8f1d5a8e.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}
