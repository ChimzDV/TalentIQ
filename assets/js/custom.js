jQuery(document).ready(function ($) {

	"use strict";



	if ($("#tabs").length && $.fn.tabs) {
		$("#tabs").tabs();
	}

	// Page loading animation
	$("#preloader").animate({
		'opacity': '0'
	}, 600, function () {
		setTimeout(function () {
			$("#preloader").css("visibility", "hidden").fadeOut();
		}, 300);
	});

	// Close mobile menu when nav-link is clicked
	$('.navbar-nav .nav-link').on('click', function () {
		if ($('.navbar-collapse').hasClass('show')) {
			$('.navbar-toggler').click();
		}
	});

	// Close mobile menu when clicking outside the header
	$(document).on('click.mobileNav', function (e) {
		var $header = $('header');
		var $collapse = $('#navbarResponsive');
		if (!$header.is(e.target) && $header.has(e.target).length === 0) {
			if ($collapse.hasClass('show')) {
				$('.navbar-toggler').click();
			}
		}
	});

	$(window).scroll(function () {
		var scroll = $(window).scrollTop();
		if (scroll > 50) {
			$("header").addClass("background-header");
		} else {
			$("header").removeClass("background-header");
		}
	});

	// IntersectionObserver for scroll animations
	if ('IntersectionObserver' in window) {
		var animationObserver = new IntersectionObserver(function (entries, observer) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					$(entry.target).addClass('visible');
					observer.unobserve(entry.target);
				}
			});
		}, {
			threshold: 0.15,
			rootMargin: "0px 0px -50px 0px"
		});
		$('.fade-in-up').each(function () {
			animationObserver.observe(this);
		});
	} else {
		$('.fade-in-up').addClass('visible');
	}

	if ($.fn.owlCarousel && $('.owl-testimonials-premium').length) {
		$('.owl-testimonials-premium').owlCarousel({
			loop: true,
			nav: true,
			dots: true,
			items: 3,
			margin: 30,
			autoplay: true,
			autoplayTimeout: 5000,
			autoplayHoverPause: true,
			smartSpeed: 700,
			navText: ["<i class='fa fa-chevron-left'></i>", "<i class='fa fa-chevron-right'></i>"],
			responsive: {
				0: {
					items: 1,
					margin: 0
				},
				768: {
					items: 2,
					margin: 20
				},
				992: {
					items: 3,
					margin: 30
				}
			}
		});
	}

	if ($.fn.owlCarousel && $('.owl-partners').length) {
		$('.owl-partners').owlCarousel({
			loop: true,
			nav: false,
			dots: true,
			items: 1,
			margin: 30,
			autoplay: false,
			smartSpeed: 700,
			autoplayTimeout: 6000,
			responsive: {
				0: {
					items: 1,
					margin: 0
				},
				460: {
					items: 1,
					margin: 0
				},
				576: {
					items: 2,
					margin: 20
				},
				992: {
					items: 4,
					margin: 30
				}
			}
		});
	}

	if ($.fn.slick && $(".Modern-Slider").length) {
		$(".Modern-Slider").slick({
			autoplay: true,
			autoplaySpeed: 10000,
			speed: 600,
			slidesToShow: 1,
			slidesToScroll: 1,
			pauseOnHover: false,
			dots: true,
			pauseOnDotsHover: true,
			cssEase: 'linear',
			draggable: false,
			prevArrow: '<button class="PrevArrow"></button>',
			nextArrow: '<button class="NextArrow"></button>'
		});
	}

	function visible(partial) {
		var $t = partial,
			$w = jQuery(window),
			viewTop = $w.scrollTop(),
			viewBottom = viewTop + $w.height(),
			_top = $t.offset().top,
			_bottom = _top + $t.height(),
			compareTop = partial === true ? _bottom : _top,
			compareBottom = partial === true ? _top : _bottom;

		return ((compareBottom <= viewBottom) && (compareTop >= viewTop) && $t.is(':visible'));
	}

	$(window).scroll(function () {
		if (visible($('.count-digit'))) {
			if ($('.count-digit').hasClass('counter-loaded')) return;
			$('.count-digit').addClass('counter-loaded');

			$('.count-digit').each(function () {
				var $this = $(this);
				jQuery({ Counter: 0 }).animate({ Counter: $this.text() }, {
					duration: 3000,
					easing: 'swing',
					step: function () {
						$this.text(Math.ceil(this.Counter));
					}
				});
			});
		}
	});

	// TalentIQ Staffing LLC custom modal functionality
	$('[data-toggle="custom-modal"]').on('click', function (e) {
		e.preventDefault();
		var target = $(this).attr('data-target');
		$(target).addClass('active');
		$('body').css('overflow', 'hidden');
	});

	$('.custom-modal-close, .custom-modal').on('click', function (e) {
		if (e.target === this) {
			$('.custom-modal').removeClass('active');
			$('body').css('overflow', 'auto');
		}
	});

	// Handle all contact form submissions to show success popup
	$('form').on('submit', function (e) {
		e.preventDefault();
		var $form = $(this);
		var name = $form.find('#name').val();
		var email = $form.find('#email').val();
		var phone = $form.find('#phone').val();

		if (name && name.trim().length < 2) {
			alert("Please enter a valid full name.");
			return;
		}

		if (email) {
			var emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
			if (!emailReg.test(email.trim())) {
				alert("Please enter a valid email address.");
				return;
			}
		}

		if (phone) {
			var phoneReg = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;
			if (phone.trim().length < 7 || !phoneReg.test(phone.trim())) {
				alert("Please enter a valid phone number.");
				return;
			}
		}

		var formId = $form.attr('id');
		if (formId === 'contact' || formId === 'request-talent-form') {
			var subject = '';
			var message = '';

			if (formId === 'contact') {
				var company = $form.find('#company').val() || '';
				var messageVal = $form.find('#message').val() || '';
				subject = 'Contact Form Submission' + (company ? ' from ' + company : '');
				message = messageVal + (company ? '\n\nCompany: ' + company : '');
			} else if (formId === 'request-talent-form') {
				var company = $form.find('#company').val() || '';
				var industry = $form.find('#industry').val() || '';
				var positionsHiring = $form.find('#positions_hiring').val() || '';
				var numberPositions = $form.find('#number_positions').val() || '';
				var employmentType = $form.find('#employment_type').val() || '';
				var location = $form.find('#location').val() || '';
				var startDate = $form.find('#start_date').val() || '';
				var jobDescription = $form.find('#job_description').val() || '';
				var additionalRequirements = $form.find('#additional_requirements').val() || '';

				subject = 'Talent Acquisition Request - ' + positionsHiring + (company ? ' at ' + company : '');
				message = 'Company: ' + company + '\n' +
						  'Industry: ' + industry + '\n' +
						  'Position(s) Hiring For: ' + positionsHiring + '\n' +
						  'Number of Positions: ' + numberPositions + '\n' +
						  'Employment Type: ' + employmentType + '\n' +
						  'Location: ' + location + '\n' +
						  'Preferred Start Date: ' + startDate + '\n\n' +
						  'Job Description / Requirements:\n' + jobDescription + '\n\n' +
						  'Additional Requirements:\n' + additionalRequirements;
			}

			var $submitBtn = $form.find('button[type="submit"]');
			var originalBtnText = $submitBtn.text();
			$submitBtn.prop('disabled', true).text('Submitting...');

			console.log('Sending form data to Apps Script:', {
				name: name,
				email: email,
				phone: phone,
				subject: subject,
				message: message
			});

			fetch('https://script.google.com/macros/s/AKfycbzxg0uBUa_seoALRoi6E8OUofAxePZHrnmJWJ9jS4XRxJLorpLRtUjEhPJgAM8tUaBg/exec', {
				method: 'POST',
				headers: {
					'Content-Type': 'text/plain;charset=utf-8'
				},
				body: JSON.stringify({
					name: name,
					email: email,
					phone: phone,
					subject: subject,
					message: message
				})
			})
			.then(function (response) {
				console.log('Apps Script raw response status:', response.status);
				if (!response.ok) {
					throw new Error('Network response was not ok (status: ' + response.status + ')');
				}
				return response.json();
			})
			.then(function (data) {
				console.log('Apps Script parsed JSON response:', data);
				if (data && data.success === true) {
					$form[0].reset();
					$('#successModal').addClass('active');
					$('body').css('overflow', 'hidden');
				} else {
					var errMsg = data && data.error ? data.error : 'Submission not successful';
					throw new Error(errMsg);
				}
			})
			.catch(function (error) {
				console.error('Error submitting form:', error);
				alert("There was an error submitting your request. Please try again.");
			})
			.finally(function () {
				$submitBtn.prop('disabled', false).text(originalBtnText);
			});
		} else if (formId === 'candidate-apply-form') {
			var locationVal = $form.find('#location').val() || '';
			var desiredPosition = $form.find('#desired_position').val() || '';
			var experience = $form.find('#experience').val() || '';
			var linkedin = $form.find('#linkedin').val() || '';
			var workAuth = $form.find('#work_authorization').val() || '';
			var startDateVal = $form.find('#start_date').val() || '';
			var coverLetter = $form.find('#cover_letter').val() || '';
			var fileInput = $form.find('#resume')[0];

			if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
				alert("Please upload your resume.");
				return;
			}

			var file = fileInput.files[0];
			var maxFileSizeMB = 10;
			var maxFileSizeBytes = maxFileSizeMB * 1024 * 1024;

			if (file.size > maxFileSizeBytes) {
				alert("File size exceeds the limit of " + maxFileSizeMB + " MB. Please choose a smaller file.");
				return;
			}

			var allowedExtensions = ['pdf', 'doc', 'docx'];
			var fileExt = file.name.split('.').pop().toLowerCase();
			if (allowedExtensions.indexOf(fileExt) === -1) {
				alert("Invalid file type. Please upload a PDF, DOC, or DOCX file.");
				return;
			}

			var $submitBtn = $form.find('button[type="submit"]');
			var originalBtnText = $submitBtn.text();
			$submitBtn.prop('disabled', true).text('Submitting...');

			var reader = new FileReader();
			reader.onload = function (e) {
				var base64Data = e.target.result.split(',')[1];
				var payload = {
					form_type: 'candidate',
					name: name,
					email: email,
					phone: phone,
					location: locationVal,
					desired_position: desiredPosition,
					experience: experience,
					linkedin: linkedin,
					work_authorization: workAuth,
					start_date: startDateVal,
					cover_letter: coverLetter,
					file: {
						base64: base64Data,
						filename: file.name,
						mimeType: file.type || 'application/octet-stream'
					}
				};

				fetch('https://script.google.com/macros/s/AKfycbzxg0uBUa_seoALRoi6E8OUofAxePZHrnmJWJ9jS4XRxJLorpLRtUjEhPJgAM8tUaBg/exec', {
					method: 'POST',
					headers: {
						'Content-Type': 'text/plain;charset=utf-8'
					},
					body: JSON.stringify(payload)
				})
				.then(function (response) {
					if (!response.ok) {
						throw new Error('Network response was not ok (status: ' + response.status + ')');
					}
					return response.json();
				})
				.then(function (data) {
					if (data && data.success === true) {
						$form[0].reset();
						$('#successModal').addClass('active');
						$('body').css('overflow', 'hidden');
					} else {
						var errMsg = data && data.error ? data.error : 'Submission not successful';
						throw new Error(errMsg);
					}
				})
				.catch(function (error) {
					console.error('Error submitting application:', error);
					alert("There was an error submitting your application: " + (error.message || "Please try again."));
				})
				.finally(function () {
					$submitBtn.prop('disabled', false).text(originalBtnText);
				});
			};

			reader.onerror = function (err) {
				console.error('Error reading file:', err);
				alert("Could not read the uploaded resume file. Please try again.");
				$submitBtn.prop('disabled', false).text(originalBtnText);
			};

			reader.readAsDataURL(file);
		} else {
			this.reset();
			$('#successModal').addClass('active');
			$('body').css('overflow', 'hidden');
		}
	});

	// --- Executive Profile Drawer Logic ---
	function initExecutiveDrawer() {
		var $drawer = $('#executive-drawer');
		var $backdrop = $('#executive-drawer-backdrop');
		var $closeBtn = $('#executive-drawer-close');
		var lastFocusedElement = null;

		if (!$drawer.length || !$backdrop.length) {
			return;
		}

		function parseArrayAttr(attrValue) {
			if (!attrValue) return [];
			try {
				return JSON.parse(attrValue);
			} catch (e) {
				return attrValue.split(',').map(function (s) { return s.trim(); });
			}
		}

		function openDrawer($card, triggerLink) {
			lastFocusedElement = triggerLink || document.activeElement;

			var name = $card.attr('data-name') || '';
			var title = $card.attr('data-title') || '';
			var bio = $card.attr('data-bio') || '';
			var focusList = parseArrayAttr($card.attr('data-focus'));
			var expertiseList = parseArrayAttr($card.attr('data-expertise'));
			var quote = $card.attr('data-quote') || '';
			var linkedin = $card.attr('data-linkedin') || '#';
			var email = $card.attr('data-email') || '#';

			$('#drawer-exec-name').text(name);
			$('#drawer-exec-title').text(title);
			$('#drawer-exec-bio').text(bio);
			$('#drawer-exec-quote').text(quote);

			var $focusContainer = $('#drawer-exec-focus').empty();
			focusList.forEach(function (item) {
				$focusContainer.append('<span class="executive-badge">' + item + '</span>');
			});

			var $expertiseContainer = $('#drawer-exec-expertise').empty();
			expertiseList.forEach(function (item) {
				$expertiseContainer.append('<li><i class="fa fa-check"></i> ' + item + '</li>');
			});

			$('#drawer-exec-linkedin').attr('href', linkedin);
			$('#drawer-exec-email').attr('href', email.indexOf('@') !== -1 && !email.startsWith('mailto:') ? 'mailto:' + email : email);

			$backdrop.addClass('active').attr('aria-hidden', 'false');
			$drawer.addClass('active').attr('aria-hidden', 'false');
			$('body').addClass('drawer-open');

			setTimeout(function () {
				$drawer.focus();
			}, 50);
		}

		function closeDrawer() {
			$drawer.removeClass('active').attr('aria-hidden', 'true');
			$backdrop.removeClass('active').attr('aria-hidden', 'true');
			$('body').removeClass('drawer-open');

			if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
				lastFocusedElement.focus();
			}
		}

		$(document).on('click', '.executive-profile-link', function (e) {
			e.preventDefault();
			var $card = $(this).closest('.executive-leader-card');
			openDrawer($card, this);
		});

		$closeBtn.on('click', function (e) {
			e.preventDefault();
			closeDrawer();
		});

		$backdrop.on('click', function (e) {
			closeDrawer();
		});

		$(document).on('keydown', function (e) {
			if (e.key === 'Escape' || e.keyCode === 27) {
				if ($drawer.hasClass('active')) {
					closeDrawer();
				}
			}
		});
	}

	initExecutiveDrawer();

	// =========================================================================
	// SERVICES MOBILE CAROUSEL
	// Runs only when the carousel element exists and viewport < 992px.
	// Uses CSS translateX for GPU-accelerated sliding.
	// Matches @media (max-width: 991.98px) in responsive.css exactly.
	// =========================================================================
	(function initServicesMobileCarousel() {
		var $carousel = $('#servicesMobileCarousel');
		var $track = $('#smcTrack');
		var $dotsWrap = $('#smcDots');
		var $btnPrev = $('#smcPrev');
		var $btnNext = $('#smcNext');

		if (!$carousel.length || !$track.length) return;

		// Only activate below 992px — matchMedia keeps desktop clean
		var mql = window.matchMedia('(max-width: 991.98px)');

		var currentIndex = 0;
		var totalSlides = $track.find('.smc-slide').length;
		var autoTimer = null;
		var isPaused = false;
		var AUTO_DELAY = 6000; // ms

		// --- Build pagination dots ---
		function buildDots() {
			$dotsWrap.empty();
			for (var i = 0; i < totalSlides; i++) {
				(function (idx) {
					var $dot = $('<button></button>')
						.addClass('smc-dot')
						.attr({
							'type': 'button',
							'role': 'tab',
							'aria-label': 'Go to slide ' + (idx + 1),
							'aria-selected': idx === 0 ? 'true' : 'false'
						})
						.on('click', function () { goTo(idx); });
					$dotsWrap.append($dot);
				})(i);
			}
			updateDots();
		}

		function updateDots() {
			$dotsWrap.find('.smc-dot').each(function (i) {
				$(this)
					.toggleClass('is-active', i === currentIndex)
					.attr('aria-selected', i === currentIndex ? 'true' : 'false');
			});
		}

		// --- Move carousel to a given index ---
		function goTo(index) {
			// Clamp / wrap
			if (index < 0) index = totalSlides - 1;
			if (index >= totalSlides) index = 0;

			currentIndex = index;
			var offset = -(currentIndex * 100); // each slide = 100% of viewport
			$track.css('transform', 'translateX(' + offset + '%)');
			updateDots();
		}

		// --- Auto-slide ---
		function startAuto() {
			stopAuto();
			autoTimer = setInterval(function () {
				if (!isPaused) {
					goTo(currentIndex + 1);
				}
			}, AUTO_DELAY);
		}

		function stopAuto() {
			if (autoTimer) {
				clearInterval(autoTimer);
				autoTimer = null;
			}
		}

		// --- Pause on hover / focus ---
		$carousel
			.on('mouseenter focusin', function () { isPaused = true; })
			.on('mouseleave focusout', function () { isPaused = false; });

		// --- Pause on touch ---
		$carousel[0].addEventListener('touchstart', function () {
			isPaused = true;
		}, { passive: true });
		$carousel[0].addEventListener('touchend', function () {
			// Resume after a short delay so the touch-swipe can complete
			setTimeout(function () { isPaused = false; }, 800);
		}, { passive: true });

		// --- Button handlers ---
		$btnPrev.on('click', function () {
			goTo(currentIndex - 1);
			startAuto(); // reset timer on manual nav
		});
		$btnNext.on('click', function () {
			goTo(currentIndex + 1);
			startAuto();
		});

		// --- Keyboard navigation ---
		// Keyboard nav: only fires when carousel is active (< 992px)
		$(document).on('keydown.smc', function (e) {
			if (!mql.matches) return;
			if (e.key === 'ArrowLeft') { goTo(currentIndex - 1); startAuto(); }
			if (e.key === 'ArrowRight') { goTo(currentIndex + 1); startAuto(); }
		});

		// --- Touch / swipe support ---
		var touchStartX = 0;
		var touchStartY = 0;
		var isSwiping = false;

		$carousel[0].addEventListener('touchstart', function (e) {
			touchStartX = e.touches[0].clientX;
			touchStartY = e.touches[0].clientY;
			isSwiping = false;
		}, { passive: true });

		$carousel[0].addEventListener('touchmove', function (e) {
			var dx = e.touches[0].clientX - touchStartX;
			var dy = e.touches[0].clientY - touchStartY;
			// Only hijack if horizontal swipe is dominant
			if (!isSwiping && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
				isSwiping = true;
			}
		}, { passive: true });

		$carousel[0].addEventListener('touchend', function (e) {
			if (!isSwiping) return;
			var dx = e.changedTouches[0].clientX - touchStartX;
			var SWIPE_THRESHOLD = 40; // px
			if (dx < -SWIPE_THRESHOLD) {
				goTo(currentIndex + 1);
				startAuto();
			} else if (dx > SWIPE_THRESHOLD) {
				goTo(currentIndex - 1);
				startAuto();
			}
			isSwiping = false;
		}, { passive: true });

		// --- Boot ---
		function activate() {
			buildDots();
			goTo(0);
			startAuto();
		}

		// Initialise only when in mobile range
		function handleMQ(e) {
			if (e.matches) {
				activate();
			} else {
				stopAuto();
				// Reset track position so desktop sees no offset
				$track.css('transform', '');
			}
		}

		if (mql.addEventListener) {
			mql.addEventListener('change', handleMQ);
		} else {
			// Safari <14 fallback
			mql.addListener(handleMQ);
		}

		// Run immediately if already in mobile range
		if (mql.matches) {
			activate();
		}
	})();
	// =========================================================================
	// END SERVICES MOBILE CAROUSEL
	// =========================================================================

	// =========================================================================
	// SERVICES INTERACTIVE TABS & SLIDER
	// =========================================================================
	(function initServicesInteractiveTabs() {
		var $tabs = $('.staffing-nav-item');
		var $panels = $('.staffing-content-panel'); // desktop panels only
		var $navCard = $('.staffing-nav-card');
		var $prevBtn = $('#staffing-prev-btn');
		var $nextBtn = $('#staffing-next-btn');
		var $mobilePanel = $('#staffing-mobile-panel');

		if (!$tabs.length || !$panels.length || !$mobilePanel.length) return;

		function isMobile() {
			return window.matchMedia('(max-width: 991px)').matches;
		}

		// Populate the shared mobile panel from the corresponding desktop panel source
		function populateMobilePanel($srcPanel, $btn) {
			var $left = $srcPanel.find('.panel-left-content');
			var icon = $btn.data('icon') || '';
			var title = $left.find('.panel-service-title').text();
			var subhead = $left.find('.panel-service-subhead').text();
			var desc = $left.find('.panel-service-desc').text();
			var bullets = [];
			$left.find('.panel-bullets-list li').each(function () {
				bullets.push($(this).text().trim());
			});
			var imgSrc = $srcPanel.find('.panel-img').attr('src') || '';
			var imgAlt = $srcPanel.find('.panel-img').attr('alt') || '';

			$('#smp-icon').attr('class', 'fa ' + icon);
			$('#smp-title').text(title);
			$('#smp-subhead').text(subhead);
			$('#smp-desc').text(desc);

			var $ul = $('#smp-bullets').empty();
			bullets.forEach(function (b) {
				$ul.append('<li><i class="fa fa-check"></i> ' + b + '</li>');
			});

			$('#smp-img').attr({ src: imgSrc, alt: imgAlt });
		}

		// Return the last tab button in the same 2-column row as the given index
		function rowEndTab(idx) {
			var rowEnd = Math.floor(idx / 2) * 2 + 1;
			return $tabs.eq(Math.min(rowEnd, $tabs.length - 1));
		}

		// Move the mobile panel inside .staffing-nav-card after the row-end sibling
		function placePanel(idx) {
			rowEndTab(idx).after($mobilePanel);
		}

		function showMobilePanel($srcPanel, $btn) {
			var currentTarget = $mobilePanel.data('active-target');
			var thisTarget = $btn.attr('data-target');
			var idx = parseInt($btn.data('index'), 10);

			// Toggle: same card tapped again → collapse
			if (currentTarget === thisTarget) {
				$mobilePanel.data('active-target', '');
				$tabs.filter('[data-target="' + thisTarget + '"]')
					.removeClass('active').attr('aria-selected', 'false');
				$mobilePanel.slideUp(275);
				return;
			}

			// Update active tab state
			$tabs.removeClass('active').attr('aria-selected', 'false');
			$btn.addClass('active').attr('aria-selected', 'true');

			populateMobilePanel($srcPanel, $btn);
			$mobilePanel.data('active-target', thisTarget);

			if ($mobilePanel.is(':visible')) {
				// Panel already open in a different row → slide up, reposition, slide down
				var currentRowEnd = rowEndTab(
					parseInt($tabs.filter('[data-target="' + currentTarget + '"]').data('index'), 10)
				);
				var newRowEnd = rowEndTab(idx);

				if (currentRowEnd.is(newRowEnd)) {
					// Same row: content swap in place (no reposition needed)
					$mobilePanel.slideUp(150, function () {
						$mobilePanel.slideDown(275);
					});
				} else {
					$mobilePanel.slideUp(200, function () {
						placePanel(idx);
						$mobilePanel.slideDown(275);
					});
				}
			} else {
				// Panel hidden: place and open
				placePanel(idx);
				$mobilePanel.slideDown(275);
			}
		}

		// Core tab switch — routes to mobile or desktop behaviour
		function switchTab(index) {
			var $targetTab = $tabs.eq(index);
			if (!$targetTab.length) return;

			var targetId = $targetTab.attr('data-target');
			var $targetPanel = $('#' + targetId);
			if (!$targetPanel.length) return;

			if (isMobile()) {
				showMobilePanel($targetPanel, $targetTab);
			} else {
				// Desktop: classic fade-swap (skip if already active)
				if ($targetPanel.hasClass('active')) return;

				$tabs.removeClass('active').attr('aria-selected', 'false');
				$targetTab.addClass('active').attr('aria-selected', 'true');

				var $activePanel = $panels.filter('.active');
				$activePanel.fadeOut(150, function () {
					$activePanel.removeClass('active');
					$targetPanel.fadeIn(150).addClass('active');
				});

				if (index === 0) {
					$prevBtn.removeClass('active'); $nextBtn.addClass('active');
				} else if (index === $tabs.length - 1) {
					$prevBtn.addClass('active'); $nextBtn.removeClass('active');
				} else {
					$prevBtn.addClass('active'); $nextBtn.addClass('active');
				}
			}
		}

		// Event bindings
		$tabs.on('click', function (e) {
			e.preventDefault();
			switchTab($(this).data('index'));
		});

		$prevBtn.on('click', function (e) {
			e.preventDefault();
			var cur = $tabs.filter('.active').data('index');
			switchTab((cur - 1 + $tabs.length) % $tabs.length);
		});

		$nextBtn.on('click', function (e) {
			e.preventDefault();
			var cur = $tabs.filter('.active').data('index');
			switchTab((cur + 1) % $tabs.length);
		});

		// Resize: going from mobile → desktop, restore clean desktop state
		$(window).on('resize.staffingTabs', function () {
			if (!isMobile()) {
				// Pull panel out of grid and hide it
				$mobilePanel.hide().data('active-target', '').appendTo($navCard.parent());

				var activeIdx = $tabs.filter('.active').data('index');
				if (activeIdx === undefined) { activeIdx = 0; }
				$panels.hide().removeClass('active');
				$panels.eq(activeIdx).show().addClass('active');
			}
		});
	})();

	// =========================================================================
	// FORENSIC INDUSTRIES SECTION (SERVICES PAGE REDESIGN)
	// =========================================================================
	(function initForensicIndustries() {
		var $tabs = $('.ind-tab-item');
		var $panels = $('.ind-content-panel');
		var $prevBtn = $('.ind-prev-btn');
		var $nextBtn = $('.ind-next-btn');
		var $tabsList = $('.ind-tabs-list');
		var $indicator = $('.ind-active-indicator');

		if (!$tabs.length || !$panels.length) return;

		// Initialize Active Indicator position
		function updateIndicator($activeTab) {
			if (!$indicator.length || !$activeTab.length) return;
			var tabWidth = $activeTab.outerWidth();
			var tabLeft = $activeTab[0].offsetLeft;
			$indicator.css({
				left: tabLeft + 'px',
				width: tabWidth + 'px'
			});
		}

		// Count up statistics animation
		function animateCounters($panel) {
			$panel.find('.ind-stat-val').each(function () {
				var $this = $(this);
				var targetVal = parseFloat($this.attr('data-val'));
				var suffix = $this.attr('data-suffix') || '';
				var decimals = parseInt($this.attr('data-decimals')) || 0;
				
				$({ countNum: 0 }).animate({ countNum: targetVal }, {
					duration: 1000,
					easing: 'swing',
					step: function () {
						if (decimals > 0) {
							$this.text(this.countNum.toFixed(decimals) + suffix);
						} else {
							var formatted = Math.floor(this.countNum);
							if (formatted >= 1000) {
								formatted = formatted.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
							}
							$this.text(formatted + suffix);
						}
					},
					complete: function () {
						if (decimals > 0) {
							$this.text(targetVal.toFixed(decimals) + suffix);
						} else {
							var formatted = targetVal;
							if (formatted >= 1000) {
								formatted = formatted.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
							}
							$this.text(formatted + suffix);
						}
					}
				});
			});
		}

		function switchTab(index) {
			if (index < 0 || index >= $tabs.length) return;

			var $targetTab = $tabs.eq(index);
			var targetId = $targetTab.attr('aria-controls');
			var $targetPanel = $('#' + targetId);

			if (!$targetPanel.length || $targetPanel.hasClass('active')) return;

			// Update tabs and active indicator
			$tabs.removeClass('active').attr('aria-selected', 'false');
			$targetTab.addClass('active').attr('aria-selected', 'true');
			updateIndicator($targetTab);

			var $activePanel = $panels.filter('.active');
			
			// 1. Add leaving class for smooth fade out & slide left (300ms)
			$activePanel.addClass('leaving');
			
			setTimeout(function () {
				$activePanel.removeClass('active leaving').hide();
				
				// Show new panel
				$targetPanel.css('display', 'block').width(); // force reflow
				$targetPanel.addClass('active');
				
				// Trigger counter animation
				animateCounters($targetPanel);
			}, 300);

			// Scroll active tab into view in horizontal list
			var tabEl = $targetTab[0];
			if (tabEl && $tabsList.length) {
				var containerLeft = $tabsList.scrollLeft();
				var containerWidth = $tabsList.width();
				var tabLeft = tabEl.offsetLeft;
				var tabWidth = $targetTab.outerWidth();

				if (tabLeft < containerLeft) {
					$tabsList.animate({ scrollLeft: tabLeft - 20 }, 200);
				} else if ((tabLeft + tabWidth) > (containerLeft + containerWidth)) {
					$tabsList.animate({ scrollLeft: (tabLeft + tabWidth - containerWidth) + 20 }, 200);
				}
			}
		}

		// Initial setup
		var urlParams = new URLSearchParams(window.location.search);
		var industryParam = urlParams.get('industry');
		var industryMap = {
			'it': 0,
			'healthcare': 1,
			'engineering': 2,
			'aerospace': 3,
			'federal': 4
		};
		var targetIndex = 0;
		if (industryParam && industryMap.hasOwnProperty(industryParam.toLowerCase())) {
			targetIndex = industryMap[industryParam.toLowerCase()];
		}

		if (targetIndex !== 0) {
			setTimeout(function() {
				switchTab(targetIndex);
			}, 150);
		} else {
			var $initActiveTab = $tabs.filter('.active');
			if ($initActiveTab.length) {
				setTimeout(function() {
					updateIndicator($initActiveTab);
					animateCounters($panels.filter('.active'));
				}, 100);
			}
		}

		$tabs.on('click', function (e) {
			e.preventDefault();
			switchTab($(this).data('index'));
		});

		$prevBtn.on('click', function (e) {
			e.preventDefault();
			var curIdx = $tabs.filter('.active').data('index');
			var newIdx = (curIdx - 1 + $tabs.length) % $tabs.length;
			switchTab(newIdx);
		});

		$nextBtn.on('click', function (e) {
			e.preventDefault();
			var curIdx = $tabs.filter('.active').data('index');
			var newIdx = (curIdx + 1) % $tabs.length;
			switchTab(newIdx);
		});

		// Handle resize to update active indicator width/position
		$(window).on('resize.forensicTabs', function () {
			var $activeTab = $tabs.filter('.active');
			if ($activeTab.length) {
				updateIndicator($activeTab);
			}
		});
	})();

});

