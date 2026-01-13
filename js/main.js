// 메인 JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // translations 객체가 로드될 때까지 기다리는 함수
    function waitForTranslations(callback, maxAttempts = 50) {
        let attempts = 0;
        
        function check() {
            attempts++;
            const trans = window.translations;
            
            if (trans && typeof trans === 'object' && Object.keys(trans).length > 0) {
                callback(trans);
            } else if (attempts < maxAttempts) {
                setTimeout(check, 50);
            } else {
                console.error('Translations object failed to load after', maxAttempts, 'attempts');
                console.log('window.translations:', window.translations);
                console.log('typeof window.translations:', typeof window.translations);
                // 그래도 계속 진행 (에러 방지)
                if (window.translations) {
                    callback(window.translations);
                } else {
                    console.error('Translations object is not loaded. Please check translations.js');
                }
            }
        }
        
        check();
    }
    
    waitForTranslations(function(trans) {
        if (!trans) {
            console.error('Translations object is not loaded. Please check translations.js');
            return;
        }
        
        initializeApp(trans);
    });
});

function initializeApp(trans) {
    
    console.log('Translations loaded successfully:', Object.keys(trans));
    
    // 현재 언어 설정 (기본값: 한국어)
    let currentLang = localStorage.getItem('preferredLang') || 'ko';
    
    // 언어 설정 함수
    function setLanguage(lang) {
        if (!trans || !trans[lang]) {
            console.error('Translations not available for language:', lang);
            return;
        }
        
        console.log('Setting language to:', lang);
        
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
            
            if (trans[lang] && trans[lang][key]) {
                const translation = trans[lang][key];
                
                // HTML 태그가 포함된 경우 innerHTML 사용
                if (translation.includes('<br>')) {
                    element.innerHTML = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        // 페이지 타이틀 변경
        if (trans[lang] && trans[lang]['page_title']) {
            document.title = trans[lang]['page_title'];
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
    
    // 초기 언어 설정
    setLanguage(currentLang);
    
    // 언어 버튼 클릭 이벤트
    const langButtons = document.querySelectorAll('.lang-btn');
    console.log('Found language buttons:', langButtons.length);
    
    langButtons.forEach((button, index) => {
        const lang = button.getAttribute('data-lang');
        console.log(`Button ${index}: lang=${lang}`);
        
        // 클릭 이벤트 리스너 추가
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const clickedLang = this.getAttribute('data-lang');
            console.log('Language button clicked:', clickedLang);
            
            if (clickedLang && trans[clickedLang]) {
                setLanguage(clickedLang);
                
                // 버튼 활성화 상태 변경
                langButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
            } else {
                console.warn('Language not found:', clickedLang);
            }
        });
        
        // 마우스 이벤트도 추가 (디버깅용)
        button.addEventListener('mousedown', function() {
            console.log('Button mousedown:', this.getAttribute('data-lang'));
        });
    });
    
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
    
    // Swiper 초기화
    if (typeof Swiper !== 'undefined') {
        // 눈썹 시술사진 Swiper
        const eyebrowSwiper = new Swiper('.eyebrow-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            loopAdditionalSlides: 2,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.eyebrow-swiper .swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.eyebrow-swiper .swiper-button-next',
                prevEl: '.eyebrow-swiper .swiper-button-prev',
            },
            breakpoints: {
                640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                    loopAdditionalSlides: 1,
                },
                768: {
                    slidesPerView: 3,
                    spaceBetween: 20,
                    loopAdditionalSlides: 1,
                },
                1024: {
                    slidesPerView: 6,
                    spaceBetween: 20,
                    loopAdditionalSlides: 2,
                },
            },
        });
        
        // 입술 시술사진 Swiper
        const lipSwiper = new Swiper('.lip-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            loopAdditionalSlides: 2,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.lip-swiper .swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.lip-swiper .swiper-button-next',
                prevEl: '.lip-swiper .swiper-button-prev',
            },
            breakpoints: {
                640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                    loopAdditionalSlides: 1,
                },
                768: {
                    slidesPerView: 3,
                    spaceBetween: 20,
                    loopAdditionalSlides: 1,
                },
                1024: {
                    slidesPerView: 6,
                    spaceBetween: 20,
                    loopAdditionalSlides: 2,
                },
            },
        });
        
        // 후기 모음 Swiper
        const reviewsSwiper = new Swiper('.reviews-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            loopAdditionalSlides: 2,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.reviews-swiper .swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.reviews-swiper .swiper-button-next',
                prevEl: '.reviews-swiper .swiper-button-prev',
            },
            breakpoints: {
                640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                    loopAdditionalSlides: 1,
                },
                768: {
                    slidesPerView: 3,
                    spaceBetween: 20,
                    loopAdditionalSlides: 1,
                },
                1024: {
                    slidesPerView: 6,
                    spaceBetween: 20,
                    loopAdditionalSlides: 2,
                },
            },
        });
    }
    
    // 콘솔 로그 (개발자용)
    console.log('%c가은다움 뷰티 웹사이트', 'color: #8B7355; font-size: 20px; font-weight: bold;');
    console.log('%cKorean PMU Artist - Premium Semi-Permanent Makeup', 'color: #C4A07A; font-size: 14px;');
    console.log('%c현재 언어: ' + currentLang.toUpperCase(), 'color: #666; font-size: 12px;');
}