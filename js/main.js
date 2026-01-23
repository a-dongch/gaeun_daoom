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
        
        // 언어 변경 후 스크롤 위치 확인하여 자동 축소
        setTimeout(() => {
            const languageSelector = document.getElementById('languageSelector');
            if (languageSelector) {
                const scrollTop = window.pageYOffset || 
                                 document.documentElement.scrollTop || 
                                 window.scrollY || 
                                 document.body.scrollTop || 
                                 0;
                
                // 스크롤 위치가 100px 이상이면 축소
                if (scrollTop > 100) {
                    if (isExpanded || !languageSelector.classList.contains('collapsed')) {
                        languageSelector.classList.add('collapsed');
                        isExpanded = false;
                        console.log('✓ Language changed - auto collapsed (scrollTop:', scrollTop, ')');
                    }
                }
            }
        }, 300); // 언어 변경 애니메이션 후 축소
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
        console.log('Language selector found, initializing scroll handler');
        
        // 초기 스크롤 위치 확인 및 상태 설정 (모바일 대응)
        function checkScrollPosition() {
            // 모바일과 데스크톱 모두에서 작동하는 스크롤 위치 확인
            const scrollTop = window.pageYOffset || 
                             document.documentElement.scrollTop || 
                             window.scrollY || 
                             document.body.scrollTop || 
                             0;
        
        if (scrollTop > 100) {
                // 스크롤 다운 시 축소
                if (isExpanded) {
                    languageSelector.classList.add('collapsed');
                    isExpanded = false;
                    console.log('✓ Language selector collapsed (scroll > 100, scrollTop:', scrollTop, ')');
                }
        } else {
                // 스크롤 상단으로 돌아오면 확장
                if (!isExpanded) {
                    languageSelector.classList.remove('collapsed');
                    isExpanded = true;
                    console.log('✓ Language selector expanded (scroll <= 100, scrollTop:', scrollTop, ')');
                }
            }
        }
        
        // 초기 스크롤 위치 확인
        checkScrollPosition();
        
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
                // 언어 변경 후 스크롤 위치 확인하여 축소
                setTimeout(() => {
                    const scrollTop = window.pageYOffset || 
                                   document.documentElement.scrollTop || 
                                   window.scrollY || 
                                   document.body.scrollTop || 
                                   0;
                    
                    // 스크롤 위치가 100px 이상이면 축소
                    if (scrollTop > 100) {
                        if (isExpanded || !languageSelector.classList.contains('collapsed')) {
                            languageSelector.classList.add('collapsed');
                            isExpanded = false;
                            console.log('✓ Language changed - collapsed (scrollTop:', scrollTop, ')');
                        }
                    }
                }, 300); // 언어 변경 애니메이션 후 축소
            }, false); // bubble phase에서 처리
        });
        
        // 스크롤 이벤트 핸들러 - 스크롤 시 언어 선택기 축소/확장 (모바일 대응)
        let scrollTimeout;
        let ticking = false;
        
        function onScroll() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    checkScrollPosition();
                    ticking = false;
                });
                ticking = true;
            }
        }
        
        // 여러 이벤트 타입에 리스너 추가 (모바일 대응)
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('touchmove', onScroll, { passive: true });
        document.addEventListener('scroll', onScroll, { passive: true });
        
        // 모바일에서 스크롤 종료 후에도 확인
        let scrollEndTimeout;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollEndTimeout);
            scrollEndTimeout = setTimeout(function() {
                checkScrollPosition();
            }, 150);
        }, { passive: true });
        
        // 터치 종료 후에도 확인 (모바일)
        let touchEndTimeout;
        document.addEventListener('touchend', function() {
            clearTimeout(touchEndTimeout);
            touchEndTimeout = setTimeout(function() {
                checkScrollPosition();
            }, 100);
        }, { passive: true });
        
        // 모바일에서 스크롤 감지를 위한 추가 방법 (Intersection Observer 사용)
        const observerTarget = document.querySelector('.hero') || document.body;
        if (observerTarget && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    // hero 섹션이 뷰포트에서 벗어나면 축소
                    if (!entry.isIntersecting) {
                        if (isExpanded) {
                            const scrollTop = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || document.body.scrollTop || 0;
                            if (scrollTop > 100) {
                                languageSelector.classList.add('collapsed');
                                isExpanded = false;
                                console.log('✓ Language selector collapsed (via IntersectionObserver)');
                            }
                        }
                    } else {
                        // hero 섹션이 뷰포트에 보이면 확장
                        if (!isExpanded) {
                            languageSelector.classList.remove('collapsed');
                            isExpanded = true;
                            console.log('✓ Language selector expanded (via IntersectionObserver)');
                        }
                    }
                });
            }, {
                root: null,
                rootMargin: '-100px 0px 0px 0px',
                threshold: 0
            });
            
            observer.observe(observerTarget);
        }
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
        // 눈썹 시술사진 Swiper - 무한 루프 보장 (25개 이미지)
        const eyebrowSwiper = new Swiper('.eyebrow-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            loopedSlides: 25,
            loopAdditionalSlides: 25,
            watchSlidesProgress: true,
            speed: 800,
            autoplay: {
                delay: 2000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            freeMode: false,
            effect: 'slide',
            allowTouchMove: true,
            touchRatio: 1,
            simulateTouch: true,
            grabCursor: true,
            navigation: false,
            centeredSlides: false,
            breakpoints: {
                640: {
                    slidesPerView: 1.5,
                    spaceBetween: 15,
                    centeredSlides: true,
                    loopedSlides: 25,
                    loopAdditionalSlides: 25,
                },
                768: {
                    slidesPerView: 2.5,
                    spaceBetween: 15,
                    centeredSlides: true,
                    loopedSlides: 25,
                    loopAdditionalSlides: 25,
                },
                1024: {
                    slidesPerView: 10,
                    spaceBetween: 15,
                    centeredSlides: false,
                    loopedSlides: 25,
                    loopAdditionalSlides: 25,
                },
            },
            on: {
                init: function() {
                    // 초기화 후 업데이트
                    setTimeout(() => {
                        this.update();
                    }, 100);
                },
            },
        });
        
        // 이미지 로드 후 Swiper 업데이트
        const eyebrowImages = document.querySelectorAll('.eyebrow-swiper img');
        let loadedImages = 0;
        eyebrowImages.forEach(img => {
            if (img.complete) {
                loadedImages++;
            } else {
                img.addEventListener('load', function() {
                    loadedImages++;
                    if (loadedImages === eyebrowImages.length) {
                        eyebrowSwiper.update();
                    }
                });
            }
        });
        
        if (loadedImages === eyebrowImages.length) {
            setTimeout(() => {
                eyebrowSwiper.update();
            }, 100);
        }
        
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
        
        // Swiper의 기본 autoplay 사용 - 자연스러운 무한 루프
        if (eyebrowSwiper) {
            // 마우스 호버 시 일시정지 (이미 autoplay 설정에 포함됨)
            const eyebrowSwiperEl = document.querySelector('.eyebrow-swiper');
            if (eyebrowSwiperEl) {
                eyebrowSwiperEl.addEventListener('mouseenter', () => {
                    if (eyebrowSwiper.autoplay) {
                        eyebrowSwiper.autoplay.pause();
                    }
                });
                
                eyebrowSwiperEl.addEventListener('mouseleave', () => {
                    if (eyebrowSwiper.autoplay) {
                        eyebrowSwiper.autoplay.resume();
                    }
                });
            }
            
            // 테스트 로그
            console.log('=== Eyebrow Gallery Swiper 초기화 ===');
            eyebrowSwiper.on('init', function() {
                console.log('Eyebrow Swiper initialized, total slides:', this.slides.length);
                console.log('Loop enabled:', this.params.loop);
                console.log('Autoplay delay:', this.params.autoplay.delay);
            });
            
            eyebrowSwiper.on('slideChange', function() {
                console.log('Eyebrow slide changed - Real index:', this.realIndex, 'Active index:', this.activeIndex);
                // 마지막 이미지(realIndex 24) 다음이면 첫 번째로 이동 (무한 루프 보장 - 25개 이미지)
                if (this.realIndex >= 24) {
                    setTimeout(() => {
                        if (this.autoplay && this.autoplay.running) {
                            this.slideToLoop(0, 800);
                        }
                    }, 2100);
                }
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
            'images/gallery-eyebrow/eyebrow10.jpeg',
            'images/gallery-eyebrow/eyebrow11.jpeg',
            'images/gallery-eyebrow/eyebrow12.jpeg',
            'images/gallery-eyebrow/eyebrow13.jpeg',
            'images/gallery-eyebrow/eyebrow14.jpeg',
            'images/gallery-eyebrow/eyebrow15.jpeg',
            'images/gallery-eyebrow/eyebrow16.jpeg',
            'images/gallery-eyebrow/eyebrow17.jpeg',
            'images/gallery-eyebrow/eyebrow18.jpeg',
            'images/gallery-eyebrow/eyebrow19.jpeg',
            'images/gallery-eyebrow/eyebrow20.jpeg',
            'images/gallery-eyebrow/eyebrow21.jpeg',
            'images/gallery-eyebrow/eyebrow22.jpeg',
            'images/gallery-eyebrow/eyebrow23.jpeg',
            'images/gallery-eyebrow/eyebrow24.jpeg',
            'images/gallery-eyebrow/eyebrow25.jpeg'
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
        
        // 입술 시술사진 Swiper - 무한 루프 보장
        const lipSwiper = new Swiper('.lip-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            loopedSlides: 20,
            loopAdditionalSlides: 20,
            watchSlidesProgress: true,
            speed: 800,
            autoplay: {
                delay: 2000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            freeMode: false,
            effect: 'slide',
            allowTouchMove: true,
            touchRatio: 1,
            simulateTouch: true,
            grabCursor: true,
            navigation: false,
            centeredSlides: false,
            breakpoints: {
                640: {
                    slidesPerView: 1.5,
                    spaceBetween: 15,
                    centeredSlides: true,
                    loopedSlides: 20,
                    loopAdditionalSlides: 20,
                },
                768: {
                    slidesPerView: 2.5,
                    spaceBetween: 15,
                    centeredSlides: true,
                    loopedSlides: 20,
                    loopAdditionalSlides: 20,
                },
                1024: {
                    slidesPerView: 10,
                    spaceBetween: 15,
                    centeredSlides: false,
                    loopedSlides: 20,
                    loopAdditionalSlides: 20,
                },
            },
            on: {
                init: function() {
                    // 초기화 후 업데이트
                    setTimeout(() => {
                        this.update();
                    }, 100);
                },
            },
        });
        
        // 이미지 로드 후 Swiper 업데이트
        const lipImages = document.querySelectorAll('.lip-swiper img');
        let loadedLipImages = 0;
        lipImages.forEach(img => {
            if (img.complete) {
                loadedLipImages++;
            } else {
                img.addEventListener('load', function() {
                    loadedLipImages++;
                    if (loadedLipImages === lipImages.length) {
                        lipSwiper.update();
                    }
                });
            }
        });
        
        if (loadedLipImages === lipImages.length) {
            setTimeout(() => {
                lipSwiper.update();
            }, 100);
        }
        
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
        
        // Swiper의 기본 autoplay 사용 - 자연스러운 무한 루프
        if (lipSwiper) {
            // 마우스 호버 시 일시정지 (이미 autoplay 설정에 포함됨)
            const lipSwiperEl = document.querySelector('.lip-swiper');
            if (lipSwiperEl) {
                lipSwiperEl.addEventListener('mouseenter', () => {
                    if (lipSwiper.autoplay) {
                        lipSwiper.autoplay.pause();
                    }
                });
                
                lipSwiperEl.addEventListener('mouseleave', () => {
                    if (lipSwiper.autoplay) {
                        lipSwiper.autoplay.resume();
                    }
                });
            }
            
            // 테스트 로그
            console.log('=== Lip Gallery Swiper 초기화 ===');
            lipSwiper.on('init', function() {
                console.log('Lip Swiper initialized, total slides:', this.slides.length);
                console.log('Loop enabled:', this.params.loop);
                console.log('Autoplay delay:', this.params.autoplay.delay);
            });
            
            lipSwiper.on('slideChange', function() {
                console.log('Lip slide changed - Real index:', this.realIndex, 'Active index:', this.activeIndex);
                // 마지막 이미지 다음이면 첫 번째로 이동 (무한 루프 보장)
                if (this.realIndex >= 19) {
                    setTimeout(() => {
                        if (this.autoplay && this.autoplay.running) {
                            this.slideToLoop(0, 800);
                        }
                    }, 2100);
                }
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