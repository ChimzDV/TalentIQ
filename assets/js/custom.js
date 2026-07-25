jQuery(document).ready(function($) {

	"use strict";

	// --- TalentIQ Staffing LLC Interactive Chatbot Widget ---
	function initChatbotWidget() {
		var $toggleBtn = $('#chatbot-toggle-btn');
		var $drawer = $('#chatbot-window');
		var $closeBtn = $('#chatbot-close-btn');

		if (!$toggleBtn.length || !$drawer.length) {
			return;
		}

		var chatbotWelcomeSent = false;

		function addChatbotMessage(text, sender) {
			var msgClass = sender === 'bot' ? 'bot' : 'user';
			var msgHtml = '<div class="chat-msg ' + msgClass + '">' + text + '</div>';
			var $msgContainer = $('#chatbot-messages');
			$msgContainer.append(msgHtml);
			$msgContainer.scrollTop($msgContainer[0].scrollHeight);
		}

		function renderQuickReplies() {
			var replies = [
				{ text: "Request Talent", action: "request_staff" },
				{ text: "View Services", action: "view_services" },
				{ text: "Contact Us", action: "contact_us" }
			];
			var $repliesContainer = $('#chatbot-quick-replies');
			$repliesContainer.empty();
			replies.forEach(function(reply) {
				var btnHtml = '<button type="button" class="quick-reply-btn" data-action="' + reply.action + '">' + reply.text + '</button>';
				$repliesContainer.append(btnHtml);
			});
		}

		function handleBotResponse(action) {
			var botReply = "";

			if (action === "request_staff") {
				botReply = "Excellent! You can request talent across IT & Digital, Healthcare, Engineering & Technical, Aerospace & Defense, or Federal & Government Staffing by visiting our <a href='contact.html'>Contact Us page</a> or filling out the form on our homepage.";
			} else if (action === "view_services") {
				botReply = "We specialize in 5 core staffing categories: IT & Digital, Healthcare, Engineering & Technical, Aerospace & Defense, and Federal & Government Staffing. Explore all services on our <a href='services.html'>Services page</a>.";
			} else if (action === "contact_us") {
				botReply = "Feel free to reach out on our <a href='contact.html'>Contact page</a> or email us at <a href='mailto:info@talentiqstaffing.com'>info@talentiqstaffing.com</a>.";
			} else {
				botReply = "Thank you for your message! A TalentIQ Staffing LLC representative will contact you shortly, or you can use the quick links below to explore our services.";
			}

			setTimeout(function() {
				addChatbotMessage(botReply, 'bot');
				renderQuickReplies();
			}, 600);
		}

		function openChatbot() {
			$drawer.addClass('active');

			if (!chatbotWelcomeSent) {
				chatbotWelcomeSent = true;
				setTimeout(function() {
					addChatbotMessage("Hello! Whether you're looking to hire top professionals or find your next opportunity, how can TalentIQ Staffing LLC help you today?", "bot");
					renderQuickReplies();
				}, 300);
			}
		}

		function closeChatbot() {
			$drawer.removeClass('active');
		}

		$toggleBtn.off('click.chatbot').on('click.chatbot', function(e) {
			e.preventDefault();
			e.stopPropagation();

			if ($drawer.hasClass('active')) {
				closeChatbot();
			} else {
				openChatbot();
			}
		});

		$closeBtn.off('click.chatbot').on('click.chatbot', function(e) {
			e.preventDefault();
			e.stopPropagation();
			closeChatbot();
		});

		$('#chatbot-quick-replies').off('click.chatbot').on('click.chatbot', '.quick-reply-btn', function(e) {
			e.preventDefault();
			var action = $(this).attr('data-action');
			var text = $(this).text();
			addChatbotMessage(text, 'user');
			$('#chatbot-quick-replies').empty();
			handleBotResponse(action);
		});

		function submitChatInput() {
			var $input = $('#chatbot-text-input');
			var text = $input.val().trim();
			if (text) {
				addChatbotMessage(text, 'user');
				$input.val('');
				$('#chatbot-quick-replies').empty();
				handleBotResponse('custom');
			}
		}

		$('#chatbot-send-btn').off('click.chatbot').on('click.chatbot', function(e) {
			e.preventDefault();
			submitChatInput();
		});

		$('#chatbot-text-input').off('keypress.chatbot').on('keypress.chatbot', function(e) {
			if (e.which === 13) {
				e.preventDefault();
				submitChatInput();
			}
		});
	}

	initChatbotWidget();

	if ($("#tabs").length && $.fn.tabs) {
		$("#tabs").tabs();
	}

	// Page loading animation
	$("#preloader").animate({
		'opacity': '0'
	}, 600, function() {
		setTimeout(function() {
			$("#preloader").css("visibility", "hidden").fadeOut();
		}, 300);
	});

	$(window).scroll(function() {
		var scroll = $(window).scrollTop();
		if (scroll > 50) {
			$("header").addClass("background-header");
		} else {
			$("header").removeClass("background-header");
		}
	});

	// IntersectionObserver for scroll animations
	if ('IntersectionObserver' in window) {
		var animationObserver = new IntersectionObserver(function(entries, observer) {
			entries.forEach(function(entry) {
				if (entry.isIntersecting) {
					$(entry.target).addClass('visible');
					observer.unobserve(entry.target);
				}
			});
		}, {
			threshold: 0.15,
			rootMargin: "0px 0px -50px 0px"
		});
		$('.fade-in-up').each(function() {
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

	$(window).scroll(function() {
		if (visible($('.count-digit'))) {
			if ($('.count-digit').hasClass('counter-loaded')) return;
			$('.count-digit').addClass('counter-loaded');

			$('.count-digit').each(function() {
				var $this = $(this);
				jQuery({ Counter: 0 }).animate({ Counter: $this.text() }, {
					duration: 3000,
					easing: 'swing',
					step: function() {
						$this.text(Math.ceil(this.Counter));
					}
				});
			});
		}
	});

	// TalentIQ Staffing LLC custom modal functionality
	$('[data-toggle="custom-modal"]').on('click', function(e) {
		e.preventDefault();
		var target = $(this).attr('data-target');
		$(target).addClass('active');
		$('body').css('overflow', 'hidden');
	});

	$('.custom-modal-close, .custom-modal').on('click', function(e) {
		if (e.target === this) {
			$('.custom-modal').removeClass('active');
			$('body').css('overflow', 'auto');
		}
	});

	// Handle all contact form submissions to show success popup
	$('form').on('submit', function(e) {
		e.preventDefault();
		this.reset();
		$('#successModal').addClass('active');
		$('body').css('overflow', 'hidden');
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
				return attrValue.split(',').map(function(s) { return s.trim(); });
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
			focusList.forEach(function(item) {
				$focusContainer.append('<span class="executive-badge">' + item + '</span>');
			});

			var $expertiseContainer = $('#drawer-exec-expertise').empty();
			expertiseList.forEach(function(item) {
				$expertiseContainer.append('<li><i class="fa fa-check"></i> ' + item + '</li>');
			});

			$('#drawer-exec-linkedin').attr('href', linkedin);
			$('#drawer-exec-email').attr('href', email.indexOf('@') !== -1 && !email.startsWith('mailto:') ? 'mailto:' + email : email);

			$backdrop.addClass('active').attr('aria-hidden', 'false');
			$drawer.addClass('active').attr('aria-hidden', 'false');
			$('body').addClass('drawer-open');

			setTimeout(function() {
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

		$(document).on('click', '.executive-profile-link', function(e) {
			e.preventDefault();
			var $card = $(this).closest('.executive-leader-card');
			openDrawer($card, this);
		});

		$closeBtn.on('click', function(e) {
			e.preventDefault();
			closeDrawer();
		});

		$backdrop.on('click', function(e) {
			closeDrawer();
		});

		$(document).on('keydown', function(e) {
			if (e.key === 'Escape' || e.keyCode === 27) {
				if ($drawer.hasClass('active')) {
					closeDrawer();
				}
			}
		});
	}

	initExecutiveDrawer();

});

