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
    
    // 언어 선택기 확장/축소 상태 (전역 변수로 선언)
    let isExpanded = true;
    
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
    
    // 언어 버튼 클릭 이벤트 (언어 변경 로직)
    const langButtons = document.querySelectorAll('.lang-btn');
    console.log('Found language buttons:', langButtons.length);
    
    langButtons.forEach((button, index) => {
        const lang = button.getAttribute('data-lang');
        console.log(`Button ${index}: lang=${lang}`);
        
        // 클릭 이벤트 리스너 추가
        button.addEventListener('click', function(e) {
            const languageSelector = document.getElementById('languageSelector');
            const isCollapsed = languageSelector && languageSelector.classList.contains('collapsed');
            
            // 축소된 상태에서는 언어 변경하지 않고 확장만
            if (isCollapsed) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                languageSelector.classList.remove('collapsed');
                if (typeof isExpanded !== 'undefined') {
                    isExpanded = true;
                }
                return false;
            }
            
            // 확장된 상태에서만 언어 변경
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
    
    // 스크롤 시 언어 선택기 축소/확장
    let lastScrollTop = 0;
    const languageSelector = document.getElementById('languageSelector');
    
    if (languageSelector) {
        // 축소된 상태에서 클릭 시 확장 (capture phase에서 먼저 처리)
        languageSelector.addEventListener('click', function(e) {
            if (languageSelector.classList.contains('collapsed')) {
                console.log('Language selector clicked (collapsed state) - expanding');
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                languageSelector.classList.remove('collapsed');
                isExpanded = true;
                return false;
            }
        }, true); // capture phase에서 처리하여 다른 이벤트보다 먼저 실행
        
        // 확장된 상태에서 언어 변경 후 자동 축소
        const langButtons = languageSelector.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            // 언어 변경 후 축소를 위한 추가 리스너
            btn.addEventListener('click', function(e) {
                // 확장된 상태에서 언어 변경 후 축소
                if (!languageSelector.classList.contains('collapsed') && isExpanded) {
                    console.log('Language changed, will collapse after delay');
                    setTimeout(() => {
                        if (window.pageYOffset > 100 && isExpanded) {
                            languageSelector.classList.add('collapsed');
                            isExpanded = false;
                        }
                    }, 400);
                }
            }, false); // bubble phase에서 처리
        });
        
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100) {
                // 스크롤 다운 시 축소
                if (isExpanded) {
                    languageSelector.classList.add('collapsed');
                    isExpanded = false;
                }
                languageSelector.style.background = 'rgba(255, 255, 255, 0.98)';
                languageSelector.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.15)';
            } else {
                // 스크롤 상단으로 돌아오면 확장
                if (!isExpanded) {
                    languageSelector.classList.remove('collapsed');
                    isExpanded = true;
                }
                languageSelector.style.background = 'rgba(255, 255, 255, 0.95)';
                languageSelector.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            }
            
            lastScrollTop = scrollTop;
        });
    }
    
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
    
    // FAQ 아코디언 기능
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // 다른 모든 FAQ 닫기
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // 현재 FAQ 토글
            if (isActive) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
        });
    });
    
    // Swiper 초기화
    if (typeof Swiper !== 'undefined') {
        // 무한 루프가 제대로 작동하도록 슬라이드를 충분히 복제
        const eyebrowSwiperEl = document.querySelector('.eyebrow-swiper .swiper-wrapper');
        if (eyebrowSwiperEl) {
            const originalSlides = eyebrowSwiperEl.querySelectorAll('.swiper-slide:not(.cloned-slide)');
            const originalCount = originalSlides.length;
            
            // PC에서 10개를 보여주려면 최소 30개 이상의 슬라이드가 필요 (3배 복제)
            // 모바일에서도 끊김 없이 작동하도록 충분히 복제
            if (originalCount === 10) {
                // 3번 복제하여 총 40개로 만들기 (원본 10개 + 복제 30개)
                for (let copy = 0; copy < 3; copy++) {
                    originalSlides.forEach((slide, index) => {
                        const clonedSlide = slide.cloneNode(true);
                        clonedSlide.classList.add('cloned-slide');
                        // data-index도 복제 슬라이드에 맞게 조정
                        const clonedImg = clonedSlide.querySelector('.gallery-img');
                        if (clonedImg) {
                            clonedImg.setAttribute('data-index', index);
                        }
                        eyebrowSwiperEl.appendChild(clonedSlide);
                    });
                }
            }
        }
        
        // 눈썹 시술사진 Swiper
        const eyebrowSwiper = new Swiper('.eyebrow-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            loopedSlides: 30,
            loopAdditionalSlides: 30,
            watchSlidesProgress: true,
            speed: 300,
            autoplay: {
                delay: 1,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                reverseDirection: false,
            },
            freeMode: {
                enabled: false,
            },
            effect: 'slide',
            allowTouchMove: true,
            touchRatio: 1,
            touchReleaseOnEdges: false,
            preventInteractionOnTransition: false,
            grabCursor: false,
            simulateTouch: false,
            navigation: false,
            breakpoints: {
                640: {
                    slidesPerView: 2,
                    spaceBetween: 12,
                    loopedSlides: 30,
                    loopAdditionalSlides: 30,
                },
                768: {
                    slidesPerView: 2.5,
                    spaceBetween: 15,
                    loopedSlides: 30,
                    loopAdditionalSlides: 30,
                },
                1024: {
                    slidesPerView: 10,
                    spaceBetween: 15,
                    loopedSlides: 30,
                    loopAdditionalSlides: 30,
                },
            },
            on: {
                init: function() {
                    // 초기화 후 자동 슬라이드 시작
                    this.autoplay.start();
                },
            },
        });
        
        // 모바일에서 전체화면 모드 방지 및 뷰포트 고정
        const eyebrowSwiperContainer = document.querySelector('.eyebrow-swiper');
        if (eyebrowSwiperContainer) {
            // 전체화면 API 방지
            document.addEventListener('fullscreenchange', function() {
                if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => {});
                }
            });
            
            // 터치 이벤트로 인한 뷰포트 변경 방지 (핀치 줌만 방지)
            eyebrowSwiperContainer.addEventListener('touchstart', function(e) {
                // 핀치 줌만 방지 (두 손가락 터치)
                if (e.touches.length === 2) {
                    e.preventDefault();
                }
            }, { passive: false });
            
            eyebrowSwiperContainer.addEventListener('touchmove', function(e) {
                // 핀치 줌만 방지
                if (e.touches.length === 2) {
                    e.preventDefault();
                }
            }, { passive: false });
            
            // 뷰포트 크기 강제 고정
            function fixViewport() {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    const width = window.innerWidth;
                    viewport.setAttribute('content', `width=${width}, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover`);
                }
            }
            
            window.addEventListener('resize', fixViewport);
            window.addEventListener('orientationchange', function() {
                setTimeout(fixViewport, 100);
            });
            
            // 초기 뷰포트 고정
            fixViewport();
        }
        
        // 자동 슬라이드 속도 조절 (끊김 없이 부드럽게, 무한 루프) - 모든 화면 크기에서 작동
        if (eyebrowSwiper) {
            let autoplayInterval = null;
            let isPaused = false;
            let isRunning = false;
            
            function startContinuousAutoplay() {
                if (isPaused) return;
                
                // 이미 실행 중이면 중지하고 재시작
                if (autoplayInterval) {
                    clearInterval(autoplayInterval);
                    autoplayInterval = null;
                }
                
                isRunning = true;
                
                // Swiper autoplay를 중지하고 수동으로 더 부드럽게 제어
                if (eyebrowSwiper.autoplay) {
                    eyebrowSwiper.autoplay.stop();
                }
                
                // 모바일 여부 확인 (768px 이하)
                const isMobile = window.innerWidth <= 768;
                const slideInterval = isMobile ? 990 : 480; // 모바일: 990ms (3배 느리게), PC: 480ms (3배 느리게)
                
                autoplayInterval = setInterval(() => {
                    if (!isPaused && eyebrowSwiper) {
                        try {
                            // loop 모드에서 slideNext()는 자동으로 무한 루프 처리됨
                            // 끝에 도달했는지 확인하고 필요시 처음으로 이동
                            if (eyebrowSwiper.isEnd && eyebrowSwiper.params.loop) {
                                // loop를 통해 처음으로 부드럽게 이동
                                eyebrowSwiper.slideToLoop(0, 0, false);
                            } else {
                                eyebrowSwiper.slideNext();
                            }
                        } catch(e) {
                            console.log('Swiper slide error:', e);
                            clearInterval(autoplayInterval);
                            autoplayInterval = null;
                            isRunning = false;
                            setTimeout(() => {
                                startContinuousAutoplay();
                            }, 200);
                        }
                    }
                }, slideInterval);
            }
            
            function stopContinuousAutoplay() {
                if (autoplayInterval) {
                    clearInterval(autoplayInterval);
                    autoplayInterval = null;
                }
                isRunning = false;
            }
            
            // 여러 방법으로 초기화 시도
            function initializeAutoplay() {
                setTimeout(() => {
                    if (!isRunning && !isPaused) {
                        console.log('Starting continuous autoplay for eyebrow gallery');
                        startContinuousAutoplay();
                    }
                }, 500);
            }
            
            // Swiper 초기화 이벤트
            eyebrowSwiper.on('init', function() {
                console.log('Eyebrow Swiper initialized, total slides:', this.slides.length);
                initializeAutoplay();
            });
            
            // 이미 초기화된 경우
            if (eyebrowSwiper.initialized) {
                console.log('Eyebrow Swiper already initialized, total slides:', eyebrowSwiper.slides.length);
                initializeAutoplay();
            } else {
                // 초기화 대기
                setTimeout(() => {
                    console.log('Eyebrow Swiper initialization check, total slides:', eyebrowSwiper.slides ? eyebrowSwiper.slides.length : 'unknown');
                    initializeAutoplay();
                }, 1000);
            }
            
            // 화면 크기 변경 시 재시작
            let resizeTimer;
            window.addEventListener('resize', function() {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    stopContinuousAutoplay();
                    setTimeout(() => {
                        if (!isPaused) {
                            startContinuousAutoplay();
                        }
                    }, 300);
                }, 300);
            });
            
            // 마우스 호버 시 일시정지
            const eyebrowSwiperEl = document.querySelector('.eyebrow-swiper');
            if (eyebrowSwiperEl) {
                eyebrowSwiperEl.addEventListener('mouseenter', () => {
                    isPaused = true;
                    stopContinuousAutoplay();
                });
                
                eyebrowSwiperEl.addEventListener('mouseleave', () => {
                    isPaused = false;
                    if (!isRunning) {
                        startContinuousAutoplay();
                    }
                });
            }
            
            // 슬라이드 변경 시 루프 확인
            eyebrowSwiper.on('slideChange', function() {
                // 루프가 제대로 작동하는지 확인
                if (!isPaused && !isRunning && !autoplayInterval) {
                    startContinuousAutoplay();
                }
            });
            
            // 루프 완료 시 재시작
            eyebrowSwiper.on('loopFix', function() {
                if (!isPaused && !isRunning) {
                    setTimeout(() => {
                        startContinuousAutoplay();
                    }, 200);
                }
            });
            
            // breakpoint 변경 시 재시작
            eyebrowSwiper.on('breakpoint', function() {
                stopContinuousAutoplay();
                setTimeout(() => {
                    if (!isPaused) {
                        startContinuousAutoplay();
                    }
                }, 300);
            });
            
            // 슬라이드 기능 테스트
            console.log('=== Eyebrow Gallery Swiper 테스트 ===');
            console.log('Total slides:', eyebrowSwiper.slides.length);
            console.log('Looped slides:', eyebrowSwiper.params.loopedSlides);
            eyebrowSwiper.on('slideChange', function() {
                console.log('Eyebrow slide changed - Real index:', this.realIndex, 'Active index:', this.activeIndex, 'Is end:', this.isEnd);
                // 무한 루프 확인
                if (this.isEnd && this.params.loop) {
                    console.log('End reached, loop should activate');
                }
            });
            
            // 네비게이션 버튼 제거됨
            
            // 무한 루프 테스트
            eyebrowSwiper.on('loopFix', function() {
                console.log('Eyebrow loop fixed - 무한 루프 작동 확인');
            });
        }
        
        // 이미지 갤러리 모달 기능
        const eyebrowImages = [
            'images/gallery-eyebrow/eyebrow1.jpeg',
            'images/gallery-eyebrow/eyebrow2.jpeg',
            'images/gallery-eyebrow/eyebrow3.jpeg',
            'images/gallery-eyebrow/eyebrow4.jpeg',
            'images/gallery-eyebrow/eyebrow5.jpeg',
            'images/gallery-eyebrow/eyebrow6.jpeg',
            'images/gallery-eyebrow/eyebrow7.jpeg',
            'images/gallery-eyebrow/eyebrow8.jpeg',
            'images/gallery-eyebrow/eyebrow9.jpeg',
            'images/gallery-eyebrow/eyebrow10.jpeg'
        ];
        
        const lipImages = [
            'images/gallery-lip/lip1.jpeg',
            'images/gallery-lip/lip2.jpeg',
            'images/gallery-lip/lip3.png',
            'images/gallery-lip/lip4.jpeg',
            'images/gallery-lip/lip5.jpeg',
            'images/gallery-lip/lip6.jpeg',
            'images/gallery-lip/lip7.png',
            'images/gallery-lip/lip8.jpeg',
            'images/gallery-lip/lip9.jpeg',
            'images/gallery-lip/lip10.jpeg',
            'images/gallery-lip/lip11.jpeg',
            'images/gallery-lip/lip12.jpeg',
            'images/gallery-lip/lip13.jpeg',
            'images/gallery-lip/lip14.jpeg',
            'images/gallery-lip/lip15.jpeg',
            'images/gallery-lip/lip16.jpeg',
            'images/gallery-lip/lip17.jpeg',
            'images/gallery-lip/lip18.jpeg',
            'images/gallery-lip/lip19.jpeg',
            'images/gallery-lip/lip20.png'
        ];
        
        let currentImageIndex = 0;
        let currentGallery = 'eyebrow'; // 'eyebrow' or 'lip'
        let currentImages = eyebrowImages;
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const modalCurrent = document.getElementById('modalCurrent');
        const modalTotal = document.getElementById('modalTotal');
        const modalClose = document.querySelector('.modal-close');
        const modalPrev = document.querySelector('.modal-prev');
        const modalNext = document.querySelector('.modal-next');
        const modalOverlay = document.querySelector('.modal-overlay');
        
        // eyebrow 이미지 클릭 이벤트
        document.querySelectorAll('.eyebrow-swiper .gallery-img').forEach((img, index) => {
            img.addEventListener('click', function() {
                currentGallery = 'eyebrow';
                currentImages = eyebrowImages;
                currentImageIndex = parseInt(this.getAttribute('data-index'));
                openModal(currentImageIndex);
            });
        });
        
        // lip 이미지 클릭 이벤트
        document.querySelectorAll('.lip-swiper .gallery-img').forEach((img, index) => {
            img.addEventListener('click', function() {
                currentGallery = 'lip';
                currentImages = lipImages;
                currentImageIndex = parseInt(this.getAttribute('data-index'));
                openModal(currentImageIndex);
            });
        });
        
        // 모달 열기
        function openModal(index) {
            currentImageIndex = index;
            modalImage.src = currentImages[currentImageIndex];
            modalCurrent.textContent = currentImageIndex + 1;
            modalTotal.textContent = currentImages.length;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        // 모달 닫기
        function closeModal() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            // 모달 닫은 후 Swiper 업데이트
            if (eyebrowSwiper && eyebrowSwiper.update) {
                setTimeout(() => {
                    eyebrowSwiper.update();
                }, 100);
            }
            if (lipSwiper && lipSwiper.update) {
                setTimeout(() => {
                    lipSwiper.update();
                }, 100);
            }
        }
        
        // 다음 이미지
        function nextImage() {
            currentImageIndex = (currentImageIndex + 1) % currentImages.length;
            modalImage.src = currentImages[currentImageIndex];
            modalCurrent.textContent = currentImageIndex + 1;
        }
        
        // 이전 이미지
        function prevImage() {
            currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
            modalImage.src = currentImages[currentImageIndex];
            modalCurrent.textContent = currentImageIndex + 1;
        }
        
        // 이벤트 리스너
        modalClose.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', closeModal);
        modalNext.addEventListener('click', nextImage);
        modalPrev.addEventListener('click', prevImage);
        
        // 키보드 이벤트
        document.addEventListener('keydown', function(e) {
            if (modal.classList.contains('active')) {
                if (e.key === 'Escape') {
                    closeModal();
                } else if (e.key === 'ArrowRight') {
                    nextImage();
                } else if (e.key === 'ArrowLeft') {
                    prevImage();
                }
            }
        });
        
        // 무한 루프가 제대로 작동하도록 lip 슬라이드를 충분히 복제
        const lipSwiperEl = document.querySelector('.lip-swiper .swiper-wrapper');
        if (lipSwiperEl) {
            const originalLipSlides = lipSwiperEl.querySelectorAll('.swiper-slide:not(.cloned-slide)');
            const originalCount = originalLipSlides.length;
            
            // PC에서 10개를 보여주려면 최소 30개 이상의 슬라이드가 필요 (3배 복제)
            // 모바일에서도 끊김 없이 작동하도록 충분히 복제
            if (originalCount === 20) {
                // 3번 복제하여 총 80개로 만들기 (원본 20개 + 복제 60개)
                for (let copy = 0; copy < 3; copy++) {
                    originalLipSlides.forEach((slide, index) => {
                        const clonedSlide = slide.cloneNode(true);
                        clonedSlide.classList.add('cloned-slide');
                        // data-index도 복제 슬라이드에 맞게 조정
                        const clonedImg = clonedSlide.querySelector('.gallery-img');
                        if (clonedImg) {
                            clonedImg.setAttribute('data-index', index);
                        }
                        lipSwiperEl.appendChild(clonedSlide);
                    });
                }
            }
        }
        
        // 입술 시술사진 Swiper
        const lipSwiper = new Swiper('.lip-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            loopedSlides: 60,
            loopAdditionalSlides: 60,
            watchSlidesProgress: true,
            speed: 300,
            autoplay: {
                delay: 1,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                reverseDirection: false,
            },
            freeMode: {
                enabled: false,
            },
            effect: 'slide',
            allowTouchMove: true,
            touchRatio: 1,
            touchReleaseOnEdges: false,
            preventInteractionOnTransition: false,
            grabCursor: false,
            simulateTouch: false,
            navigation: false,
            breakpoints: {
                640: {
                    slidesPerView: 2,
                    spaceBetween: 12,
                    loopedSlides: 60,
                    loopAdditionalSlides: 60,
                },
                768: {
                    slidesPerView: 2.5,
                    spaceBetween: 15,
                    loopedSlides: 60,
                    loopAdditionalSlides: 60,
                },
                1024: {
                    slidesPerView: 10,
                    spaceBetween: 15,
                    loopedSlides: 60,
                    loopAdditionalSlides: 40,
                },
            },
            on: {
                init: function() {
                    // 초기화 후 자동 슬라이드 시작
                    this.autoplay.start();
                },
            },
        });
        
        // 모바일에서 전체화면 모드 방지 및 뷰포트 고정 (lip-gallery)
        const lipSwiperContainer = document.querySelector('.lip-swiper');
        if (lipSwiperContainer) {
            // 전체화면 API 방지
            document.addEventListener('fullscreenchange', function() {
                if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => {});
                }
            });
            
            // 터치 이벤트로 인한 뷰포트 변경 방지 (핀치 줌만 방지)
            lipSwiperContainer.addEventListener('touchstart', function(e) {
                // 핀치 줌만 방지 (두 손가락 터치)
                if (e.touches.length === 2) {
                    e.preventDefault();
                }
            }, { passive: false });
            
            lipSwiperContainer.addEventListener('touchmove', function(e) {
                // 핀치 줌만 방지
                if (e.touches.length === 2) {
                    e.preventDefault();
                }
            }, { passive: false });
        }
        
        // lip-gallery 자동 슬라이드 속도 조절 (끊김 없이 부드럽게, 무한 루프) - 모든 화면 크기에서 작동
        if (lipSwiper) {
            let lipAutoplayInterval = null;
            let lipIsPaused = false;
            let lipIsRunning = false;
            
            function startLipContinuousAutoplay() {
                if (lipIsPaused) return;
                
                // 이미 실행 중이면 중지하고 재시작
                if (lipAutoplayInterval) {
                    clearInterval(lipAutoplayInterval);
                    lipAutoplayInterval = null;
                }
                
                lipIsRunning = true;
                
                // Swiper autoplay를 중지하고 수동으로 더 부드럽게 제어
                if (lipSwiper.autoplay) {
                    lipSwiper.autoplay.stop();
                }
                
                // 모바일 여부 확인 (768px 이하)
                const isMobile = window.innerWidth <= 768;
                const slideInterval = isMobile ? 990 : 480; // 모바일: 990ms (3배 느리게), PC: 480ms (3배 느리게)
                
                lipAutoplayInterval = setInterval(() => {
                    if (!lipIsPaused && lipSwiper) {
                        try {
                            // loop 모드에서 slideNext()는 자동으로 무한 루프 처리됨
                            // 끝에 도달했는지 확인하고 필요시 처음으로 이동
                            if (lipSwiper.isEnd && lipSwiper.params.loop) {
                                // loop를 통해 처음으로 부드럽게 이동
                                lipSwiper.slideToLoop(0, 0, false);
                            } else {
                                lipSwiper.slideNext();
                            }
                        } catch(e) {
                            console.log('Lip Swiper slide error:', e);
                            clearInterval(lipAutoplayInterval);
                            lipAutoplayInterval = null;
                            lipIsRunning = false;
                            setTimeout(() => {
                                startLipContinuousAutoplay();
                            }, 200);
                        }
                    }
                }, slideInterval);
            }
            
            function stopLipContinuousAutoplay() {
                if (lipAutoplayInterval) {
                    clearInterval(lipAutoplayInterval);
                    lipAutoplayInterval = null;
                }
                lipIsRunning = false;
            }
            
            // 여러 방법으로 초기화 시도
            function initializeLipAutoplay() {
                setTimeout(() => {
                    if (!lipIsRunning && !lipIsPaused) {
                        console.log('Starting continuous autoplay for lip gallery');
                        startLipContinuousAutoplay();
                    }
                }, 500);
            }
            
            // Swiper 초기화 이벤트
            lipSwiper.on('init', function() {
                console.log('Lip Swiper initialized, total slides:', this.slides.length);
                initializeLipAutoplay();
            });
            
            // 이미 초기화된 경우
            if (lipSwiper.initialized) {
                console.log('Lip Swiper already initialized, total slides:', lipSwiper.slides.length);
                initializeLipAutoplay();
            } else {
                // 초기화 대기
                setTimeout(() => {
                    console.log('Lip Swiper initialization check, total slides:', lipSwiper.slides ? lipSwiper.slides.length : 'unknown');
                    initializeLipAutoplay();
                }, 1000);
            }
            
            // 화면 크기 변경 시 재시작
            let lipResizeTimer;
            window.addEventListener('resize', function() {
                clearTimeout(lipResizeTimer);
                lipResizeTimer = setTimeout(() => {
                    stopLipContinuousAutoplay();
                    setTimeout(() => {
                        if (!lipIsPaused) {
                            startLipContinuousAutoplay();
                        }
                    }, 300);
                }, 300);
            });
            
            // 마우스 호버 시 일시정지
            const lipSwiperEl = document.querySelector('.lip-swiper');
            if (lipSwiperEl) {
                lipSwiperEl.addEventListener('mouseenter', () => {
                    lipIsPaused = true;
                    stopLipContinuousAutoplay();
                });
                
                lipSwiperEl.addEventListener('mouseleave', () => {
                    lipIsPaused = false;
                    if (!lipIsRunning) {
                        startLipContinuousAutoplay();
                    }
                });
            }
            
            // 슬라이드 변경 시 루프 확인
            lipSwiper.on('slideChange', function() {
                // 루프가 제대로 작동하는지 확인
                if (!lipIsPaused && !lipIsRunning && !lipAutoplayInterval) {
                    startLipContinuousAutoplay();
                }
            });
            
            // 루프 완료 시 재시작
            lipSwiper.on('loopFix', function() {
                if (!lipIsPaused && !lipIsRunning) {
                    setTimeout(() => {
                        startLipContinuousAutoplay();
                    }, 200);
                }
            });
            
            // breakpoint 변경 시 재시작
            lipSwiper.on('breakpoint', function() {
                stopLipContinuousAutoplay();
                setTimeout(() => {
                    if (!lipIsPaused) {
                        startLipContinuousAutoplay();
                    }
                }, 300);
            });
            
            // 슬라이드 기능 테스트
            console.log('=== Lip Gallery Swiper 테스트 ===');
            console.log('Total slides:', lipSwiper.slides.length);
            console.log('Looped slides:', lipSwiper.params.loopedSlides);
            lipSwiper.on('slideChange', function() {
                console.log('Lip slide changed - Real index:', this.realIndex, 'Active index:', this.activeIndex, 'Is end:', this.isEnd);
                // 무한 루프 확인
                if (this.isEnd && this.params.loop) {
                    console.log('End reached, loop should activate');
                }
            });
            
            // 네비게이션 버튼 제거됨
            
            // 무한 루프 테스트
            lipSwiper.on('loopFix', function() {
                console.log('Lip loop fixed - 무한 루프 작동 확인');
            });
        }
        
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
    
    // 슬라이드 기능 테스트 함수
    function testSliders() {
        setTimeout(() => {
            console.log('\n=== 슬라이드 기능 테스트 ===');
            
            // Eyebrow Swiper 테스트
            const eyebrowSwiper = document.querySelector('.eyebrow-swiper')?.swiper;
            if (eyebrowSwiper) {
                console.log('✓ Eyebrow Swiper 초기화됨');
                console.log('  - Loop:', eyebrowSwiper.params.loop);
                console.log('  - Autoplay:', eyebrowSwiper.params.autoplay.enabled);
                console.log('  - 총 슬라이드:', eyebrowSwiper.slides.length);
                console.log('  - 현재 인덱스:', eyebrowSwiper.realIndex);
                
                // 수동 슬라이드 테스트
                const eyebrowNav = document.querySelectorAll('.eyebrow-swiper .swiper-button-next, .eyebrow-swiper .swiper-button-prev');
                console.log('  - 네비게이션 버튼:', eyebrowNav.length, '개');
                
                // 무한 루프 테스트
                eyebrowSwiper.once('slideChange', function() {
                    console.log('  - 수동 슬라이드 작동 확인');
                });
            } else {
                console.log('✗ Eyebrow Swiper 초기화 실패');
            }
            
            // Lip Swiper 테스트
            const lipSwiper = document.querySelector('.lip-swiper')?.swiper;
            if (lipSwiper) {
                console.log('✓ Lip Swiper 초기화됨');
                console.log('  - Loop:', lipSwiper.params.loop);
                console.log('  - Autoplay:', lipSwiper.params.autoplay.enabled);
                console.log('  - 총 슬라이드:', lipSwiper.slides.length);
                console.log('  - 현재 인덱스:', lipSwiper.realIndex);
                
                // 수동 슬라이드 테스트
                const lipNav = document.querySelectorAll('.lip-swiper .swiper-button-next, .lip-swiper .swiper-button-prev');
                console.log('  - 네비게이션 버튼:', lipNav.length, '개');
                
                // 무한 루프 테스트
                lipSwiper.once('slideChange', function() {
                    console.log('  - 수동 슬라이드 작동 확인');
                });
            } else {
                console.log('✗ Lip Swiper 초기화 실패');
            }
            
            console.log('\n=== 테스트 완료 ===');
            console.log('체크 사항:');
            console.log('1. 수동 슬라이드: 네비게이션 버튼 클릭 또는 터치 스와이프');
            console.log('2. 자동 슬라이드: 자동으로 흐르는지 확인');
            console.log('3. 무한 루프: 마지막 이미지 다음이 첫 이미지인지 확인');
        }, 2000);
    }
    
    // 테스트 실행
    testSliders();
}