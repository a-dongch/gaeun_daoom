// 메인 JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 현재 언어 설정 (기본값: 한국어)
    let currentLang = localStorage.getItem('preferredLang') || 'ko';
    
    // 초기 언어 설정
    setLanguage(currentLang);
    
    // 언어 버튼 클릭 이벤트
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
            
            // 버튼 활성화 상태 변경
            langButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // 언어 설정 함수
    function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('preferredLang', lang);
        
        // body에 언어 속성 설정 (폰트 변경용)
        document.body.setAttribute('data-lang', lang);
        
        // 페이지 언어 속성 설정
        document.documentElement.setAttribute('lang', lang);
        
        // 모든 번역 가능한 요소 찾기
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            
            if (translations[lang] && translations[lang][key]) {
                const translation = translations[lang][key];
                
                // HTML 태그가 포함된 경우 innerHTML 사용
                if (translation.includes('<br>')) {
                    element.innerHTML = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        // 페이지 타이틀 변경
        if (translations[lang] && translations[lang]['page_title']) {
            document.title = translations[lang]['page_title'];
        }
        
        // 현재 활성화된 언어 버튼 표시
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            }
        });
        
        // 언어 변경 애니메이션
        document.body.style.opacity = '0.8';
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 150);
    }
    
    // 스크롤 애니메이션
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // 애니메이션 대상 요소들
    const animatedElements = document.querySelectorAll('.philosophy-card, .care-step, .spec-card, .highlight-item');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(element);
    });
    
    // 스크롤 인디케이터 클릭 이벤트
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const aboutSection = document.querySelector('.about-master');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // 스크롤 시 언어 선택기 스타일 변경
    let lastScrollTop = 0;
    const languageSelector = document.querySelector('.language-selector');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            languageSelector.style.background = 'rgba(255, 255, 255, 0.98)';
            languageSelector.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.15)';
        } else {
            languageSelector.style.background = 'rgba(255, 255, 255, 0.95)';
            languageSelector.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // 부드러운 스크롤 (네비게이션 링크용 - 추후 추가 시)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // 통계 숫자 카운트 애니메이션
    function animateCount(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + (element.textContent.includes('+') ? '+' : '');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + (element.textContent.includes('+') ? '+' : '');
            }
        }, 16);
    }
    
    // 통계 숫자 관찰자
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                
                statNumbers.forEach(stat => {
                    const text = stat.textContent;
                    let targetNumber;
                    
                    if (text.includes('4000')) {
                        targetNumber = 4000;
                    } else if (text.includes('99')) {
                        targetNumber = 99;
                    } else if (text.includes('8')) {
                        targetNumber = 8;
                    }
                    
                    if (targetNumber) {
                        animateCount(stat, targetNumber);
                    }
                });
            }
        });
    }, { threshold: 0.5 });
    
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        statsObserver.observe(heroStats);
    }
    
    // 콘솔 로그 (개발자용)
    console.log('%c가은다움 뷰티 웹사이트', 'color: #8B7355; font-size: 20px; font-weight: bold;');
    console.log('%cKorean PMU Artist - Premium Semi-Permanent Makeup', 'color: #C4A07A; font-size: 14px;');
    console.log('%c현재 언어: ' + currentLang.toUpperCase(), 'color: #666; font-size: 12px;');
});