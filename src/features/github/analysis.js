const analyzeRepositories = (repos = []) => {
  if (!Array.isArray(repos) || repos.length === 0) {
    return {
      starsReceived: 0,
      topLanguages: "None",
      uniqueLanguagesCount: 0,
      popularRepoName: "None",
      popularRepoStars: 0,
      avgRepoSize: 0,
      totalOpenIssues: 0,
    };
  }

  let starsReceived = 0;
  let totalOpenIssues = 0;
  let totalSize = 0;
  let popularRepoName = "None";
  let popularRepoStars = -1;

  const languageCounts = {};

  repos.forEach((repo) => {
    const stars = repo.stargazers_count || 0;
    starsReceived += stars;

    if (stars > popularRepoStars) {
      popularRepoStars = stars;
      popularRepoName = repo.name;
    }

    totalOpenIssues += repo.open_issues_count || 0;
    totalSize += repo.size || 0;

    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
  });

  const sortedLanguages = Object.keys(languageCounts).sort(
    (a, b) => languageCounts[b] - languageCounts[a]
  );
  const topLanguages = sortedLanguages.slice(0, 3).join(", ") || "None";
  const uniqueLanguagesCount = Object.keys(languageCounts).length;

  const avgRepoSize = Math.round(totalSize / repos.length);

  return {
    starsReceived,
    topLanguages,
    uniqueLanguagesCount,
    popularRepoName,
    popularRepoStars: Math.max(0, popularRepoStars),
    avgRepoSize,
    totalOpenIssues,
  };
};

module.exports = { analyzeRepositories };
