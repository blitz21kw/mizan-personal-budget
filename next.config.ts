import type { NextConfig } from "next";

const isGitHubPagesBuild = process.env.GITHUB_PAGES === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "mizan-personal-budget";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isGitHubPagesBuild
    ? {
        output: "export",
        trailingSlash: true,
        basePath: `/${repositoryName}`,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
