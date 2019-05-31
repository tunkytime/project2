	var apiKeyNews = "9d7028e6fd84446a83379f5c12519956";
	var apiKeyJobs = "a5ce6768d167cf7224dd2182eb9b14d4";
	var apiKeyQuotes = "eLaLSi9Uu337QxcUwX1_sAeF";
	var baseUrlNews = "https://newsapi.org/v2/top-headlines?q=technology&pageSize=100&apiKey=" + apiKeyNews;
	var baseUrlJobs = "https://authenticjobs.com/api/?api_key=" + apiKeyJobs + "&method=aj.jobs.search&format=json&categories=3";
	var baseUrlQuotes = "http://quotes.rest/quote/search.json?category=achieving-dreams&api_key=" + apiKeyQuotes + "&maxlength=160";

	var articles = [];
	var articleNum = 0;
	var articleTitle;
	var articleURL;
	var articleImage;
	var index;
	var userId = $(".currentUser").data("id");

	$(document).ready(function () {

		function randomIndex(array) {
			index = Math.floor(Math.random() * array.length);
			return index;
		};

		$.ajax({
			url: baseUrlNews,
			type: "GET",
			success: function (res) {
				console.log(res);
				for (var i = 0; i < res.articles.length; i++) {
					articles.push(res.articles[i]);
				};
				getArticles(articleNum);
			},
			error: (req, err) => {
				console.log("Request: " + JSON.stringify(req));
			}
		});

		$.ajax({
			url: baseUrlQuotes,
			type: "GET",
			success: function (res) {
				console.log(res);
				$("#quote").text(res.contents.quote);
				$("#authorQuote").text(res.contents.author);
			},
			error: function (req, err) {
				console.log("Request: " + JSON.stringify(req));
			}
		});

		$.ajax({
			url: "/api/questions",
			type: "GET",
			success: function (res) {
				var currentQuestion = res[randomIndex(res)];
				var term = currentQuestion.question;
				var answer = currentQuestion.answer;
				$("#intQuestion").text(term);
				$("#intAnswer").text(answer);
			},
			error: function (req, err) {
				console.log("Request: " + JSON.stringify(req));
			}
		});

		$.ajax({
			url: "/api/terms",
			type: "GET",
			success: function (res) {
				var currentTerm = res[randomIndex(res)];
				var term = currentTerm.term;
				var answer = currentTerm.answer;
				$("#term").text(term);
				$("#termDefine").text(answer);
			},
			error: function (req, err) {
				console.log("Request: " + JSON.stringify(req));
			}
		});

		$("#nextArt").on("click", function () {
			if (articleNum === (articles.length - 1)) {
				articleNum = 0;
			} else {
				articleNum++;
			}
			getArticles(articleNum);
		});

		$("#prevArt").on("click", function () {
			if (articleNum === 0) {
				getArticles(articleNum);
				return;
			} else {
				getArticles((articleNum--) - 1);
			}
		});

		/*<categories>
		<category id="3" name="Design &amp; User Experience"/>
		<category id="4" name="Front-end Engineering"/>
		<category id="2" name="Back-end Engineering"/>
		<category id="5" name="Apps"/>*/
		$("#getJobs").on("click", function () {
			getJobs();
		});

		function getArticles(index) {
			console.log(articleNum)
			var date = articles[index].publishedAt;
			var d = new Date(date);
			var month = d.getUTCMonth() + 1;
			var day = d.getUTCDate();
			var year = d.getUTCFullYear();
			date = `${month}/${day}/${year}`

			var article = {
				title: articles[index].title,
				author: articles[index].author,
				date: date,
				url: articles[index].url,
				image: articles[index].urlToImage,
				description: articles[index].description
			}

			//Used for Saved Articles
			articleTitle = article.title;
			articleURL = article.url;
			articleImage = article.image;

			displayInfo(article);
		};

		function displayInfo(article) {
			$("#title").text(article.title);
			if (article.author === null) {
				$("#author").text("");
			} else {
				$("#author").text(`${article.author} | `);
			}
			$("#date").text(article.date);
			$("#url").attr("href", article.url);
			$("#articleImg").attr("src", article.image);
			$("#content").text(article.description);
		};

		$("#save-article").on("click", function () {
			var savedArticle = {
				url: articleURL,
				title: articleTitle,
				image: articleImage,
				UserId: $(".currentUser").data("id")
			};

			$.ajax("/articles", {
				type: "POST",
				data: savedArticle,
				success: function (data) {
					console.log("Article saved");
					console.log(savedArticle);
				}
			});
		});

		$("#delete-article").on("click", function () {
			var id = $(this).data("id");
			// Send the DELETE request.
			$.ajax("/articles/" + id, {
				type: "DELETE"
			}).then(
				function () {
					console.log("Article Deleted", id);
					// Reload the page to get the updated list
					location.reload();
				}
			);
		});

		function getJobs() {
			$.ajax({
				url: baseUrlJobs,
				type: "GET",
				crossDomain: true,
				dataType: "jsonp",
				success: (res) => {
					console.log(res);
					var listing = res.listings.listing[0];
					$("#jobs").html(`<p>${listing.title}</p><p>${listing.category.name}</p>`);
				},
				error: (req, err) => {
					console.log("Request: " + JSON.stringify(req));
				},
				beforeSend: setHeader
			});

			function setHeader(xhr) {
				xhr.setRequestHeader('Authorization', apiKeyJobs);
			};
		};

		var newItemInput = $("input.new-item");
		var goalContainer = $(".goal-container");

		$(document).on("click", "button.delete", deleteGoal);
		$(document).on("click", "button.complete", toggleComplete);
		$(document).on("click", ".goal-item", editGoal);
		$(document).on("keyup", ".goal-item", finishEdit);
		$(document).on("blur", ".goal-item", cancelEdit);
		$(document).on("submit", "#goal-form", insertGoal);

		var goals = [];

		getGoals();

		function initializeRows() {
			goalContainer.empty();
			var rowsToAdd = [];
			for (var i = 0; i < goals.length; i++) {
				rowsToAdd.push(createNewRow(goals[i]));
			}
			goalContainer.prepend(rowsToAdd);
		}

		function getGoals() {
			$.get("/api/goals", function (data) {
				goals = data;
				initializeRows();
			});
		}

		function deleteGoal(event) {
			event.stopPropagation();
			var id = $(this).data("id");
			$.ajax({
				method: "DELETE",
				url: "/api/goals/" + id
			}).then(getGoals);
		}

		function editGoal() {
			var currentGoal = $(this).data("goal");
			$(this).children().hide();
			$(this).children("input.edit").val(currentGoal.text);
			$(this).children("input.edit").show();
			$(this).children("input.edit").focus();
		}

		function toggleComplete(event) {
			event.stopPropagation();
			var goal = $(this).parent().data("goal");
			goal.complete = !goal.complete;
			updateGoal(goal);
		}

		function finishEdit(event) {
			var updatedGoal = $(this).data("goal");
			if (event.which === 13) {
				updatedGoal.text = $(this).children("input").val().trim();
				$(this).blur();
				updateGoal(updatedGoal);
			}
		}

		function updateGoal(goal) {
			$.ajax({
				method: "PUT",
				url: "/api/goals",
				data: goal
			}).then(getGoals);
		}

		function cancelEdit() {
			var currentGoal = $(this).data("goal");
			if (currentGoal) {
				$(this).children().hide();
				$(this).children("input.edit").val(currentGoal.text);
				$(this).children("span").show();
				$(this).children("button").show();
			}
		}

		function createNewRow(goal) {
			var newInputRow = $(
				[
					"<li class='list-group-item goal-item text-left'>",
					"<span>",
					goal.text,
					"</span>",
					"<input type='text' class='edit' style='display: none;'>",
					"<button class='float-right complete btn btn-custom-fill pl-3 pr-3 pt-2 pb-2 ml-2'>✓</button>",
					"<button class='float-right bg-transparent delete btn btn-custom-outline pl-3 pr-3'>X</button>",
					"</li>"
				].join(""));

			newInputRow.find("button.delete").data("id", goal.id);
			newInputRow.find("input.edit").css("display", "none");
			newInputRow.data("goal", goal);
			if (goal.complete) {
				newInputRow.find("span").css("text-decoration", "line-through");
			}
			return newInputRow;
		}

		function insertGoal(event) {
			event.preventDefault();
			var goal = {
				text: newItemInput.val().trim(),
				complete: false,
				UserId: userId
			};

			$.post("/api/goals", goal, getGoals);
			newItemInput.val("");
		}

		// Currently Building
		var newItemInputBuild = $("input.new-item-build");
		var buildContainer = $(".build-container");

		$(document).on("click", "button.delete-build", deleteBuild);
		$(document).on("click", "button.complete-build", toggleCompleteBuild);
		$(document).on("click", ".build-item", editBuild);
		$(document).on("keyup", ".build-item", finishEditBuild);
		$(document).on("blur", ".build-item", cancelEditBuild);
		$(document).on("submit", "#build-form", insertBuild);

		var builds = [];

		getBuilds();

		function initializeRowsBuild() {
			buildContainer.empty();
			var rowsToAddBuild = [];
			for (var i = 0; i < builds.length; i++) {
				rowsToAddBuild.push(createNewRowBuild(builds[i]));
			}
			buildContainer.prepend(rowsToAddBuild);
		}

		function getBuilds() {
			$.get("/api/builds", function (data) {
				builds = data;
				initializeRowsBuild();
			});
		}

		function deleteBuild(event) {
			event.stopPropagation();
			var id = $(this).data("id");
			$.ajax({
				method: "DELETE",
				url: "/api/builds/" + id
			}).then(getBuilds);
		}

		function editBuild() {
			var currentBuild = $(this).data("build");
			$(this).children().hide();
			$(this).children("input.edit").val(currentBuild.text);
			$(this).children("input.edit").show();
			$(this).children("input.edit").focus();
		}

		function toggleCompleteBuild(event) {
			event.stopPropagation();
			var build = $(this).parent().data("build");
			build.complete = !build.complete;
			updateBuild(build);
		}

		function finishEditBuild(event) {
			var updatedBuild = $(this).data("build");
			if (event.which === 13) {
				updatedBuild.text = $(this).children("input").val().trim();
				$(this).blur();
				updateBuild(updatedBuild);
			}
		}

		function updateBuild(build) {
			$.ajax({
				method: "PUT",
				url: "/api/builds",
				data: build
			}).then(getBuilds);
		}

		function cancelEditBuild() {
			var currentBuild = $(this).data("build");
			if (currentBuild) {
				$(this).children().hide();
				$(this).children("input.edit").val(currentBuild.text);
				$(this).children("span").show();
				$(this).children("button").show();
			}
		}

		function createNewRowBuild(build) {
			var newInputRowBuild = $(
				[
					"<li class='list-group-item build-item text-left'>",
					"<span>",
					build.text,
					"</span>",
					"<input type='text' class='edit' style='display: none;'>",
					"<button class='float-right complete-build btn btn-custom-fill pl-3 pr-3 pt-2 pb-2 ml-2'>✓</button>",
					"<button class='float-right bg-transparent delete-build btn btn-custom-outline pl-3 pr-3'>X</button>",
					"</li>"
				].join(""));

			newInputRowBuild.find("button.delete-build").data("id", build.id);
			newInputRowBuild.find("input.edit").css("display", "none");
			newInputRowBuild.data("build", build);
			if (build.complete) {
				newInputRowBuild.find("span").css("text-decoration", "line-through");
			}
			return newInputRowBuild;
		}

		function insertBuild(event) {
			event.preventDefault();
			var build = {
				text: newItemInputBuild.val().trim(),
				complete: false,
				UserId: userId
			};

			$.post("/api/builds", build, getBuilds);
			newItemInputBuild.val("");
		}
	});