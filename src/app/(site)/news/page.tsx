import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { client } from "@/sanity/lib/client";
import { allNewsPostsQuery, pageBySlugQuery } from "@/sanity/lib/queries";
import { categoryLabel, formatNewsDate } from "@/lib/utils";

interface NewsPost {
  _id: string;
  title: string;
  slug: { current: string } | null;
  excerpt: string;
  publishedAt: string | null;
  category: string | null;
  author: { name: string; title: string; image: string | null } | null;
  coverImage: string | null;
}

export const metadata: Metadata = {
  title: "News",
};

export default async function NewsPage() {
  const [posts, page] = await Promise.all([
    client.fetch(allNewsPostsQuery, {}, { next: { revalidate: 60 } }).then((p: NewsPost[] | null) => p || []),
    client.fetch(pageBySlugQuery, { slug: "news" }, { next: { revalidate: 60 } }),
  ]);

  const hasPosts = posts.length > 0;

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-accent text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {page?.heroImage && (
          <>
            <Image
              src={page.heroImage}
              alt=""
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/60" />
          </>
        )}
        <div className="relative max-w-3xl mx-auto text-center">
          <h1 className="text-5xl sm:text-7xl font-bold mb-4">
            News
          </h1>
        </div>
        {page?.imageCredit && (
          <span className="absolute bottom-2 right-3 text-[9px] text-white/50">
            {page.imageCredit}
          </span>
        )}
      </section>

      {/* Accent divider bar */}
      <div className="h-1 bg-accent" />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {hasPosts ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post) => {
              const slug = post.slug?.current;
              const inner = (
                <article
                  className="bg-gray-light rounded-lg overflow-hidden flex flex-col h-full"
                >
                  {post.coverImage && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-8 flex flex-col flex-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                      {categoryLabel(post.category)}
                    </span>
                    <h2 className="text-xl font-bold mt-2 mb-3">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-primary/70 leading-relaxed mb-4 flex-1">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-primary/40">
                      <span>{formatNewsDate(post.publishedAt)}</span>
                      {post.author && <span>{post.author.name}</span>}
                    </div>
                  </div>
                </article>
              );

              return slug ? (
                <Link key={post._id} href={`/news/${slug}`} className="group">
                  {inner}
                </Link>
              ) : (
                <div key={post._id}>{inner}</div>
              );
            })}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-primary/40">
              No news posts yet. Check back for updates.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
