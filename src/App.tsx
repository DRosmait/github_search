import React, { ChangeEventHandler, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import "./App.css";

function App() {
  const step = 5;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 200);
  const [repos, setRepos] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!debouncedSearch) {
      setPage(1);
      setRepos({});
      return;
    }

    setIsLoading(true);

    fetch(
      `https://api.github.com/search/repositories?q=${debouncedSearch}&per_page=${step}&page=${page}`
    )
      .then((res) => res.json())
      .then((data) =>
        setRepos((value: any) => {
          return page === 1
            ? data
            : {
                ...value,
                ...data,
                items: [...(value.items || []), ...data.items],
              };
        })
      )
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [debouncedSearch, page]);

  const onChange: ChangeEventHandler = ({ target }) => {
    setSearch((target as HTMLInputElement).value);
  };

  const loadMore = () => {
    setPage((value) => value + 1);
  };

  const resetSearch = () => {
    setSearch("");
  };

  return (
    <div className="app-wrapper">
      <div className="content">
        <div className="search">
          <input
            className="search-input"
            type="text"
            value={search}
            onChange={onChange}
          />
          {debouncedSearch && (
            <button className="search-reset" onClick={resetSearch}>
              ❌
            </button>
          )}
        </div>

        <div>
          {repos.total_count > 0 && (
            <div>
              <div className="card-list">
                {repos.items.map((item: any) => (
                  <a key={item.id} href={item.url}>
                    <div className="card">
                      <div className="card__first-line">
                        <div className="card__avatar">
                          <img
                            src={item.owner.avatar_url}
                            alt={item.owner.login}
                          />
                        </div>

                        <h3 className="card__title">{item.name}</h3>

                        <div className="card__stars">
                          {item.stargazers_count} ⭐️{" "}
                        </div>
                      </div>

                      <div className="card__description u-line-clamp-2">
                        {item.description}
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {isLoading && <div>Loading...</div>}

              <div className="count">
                {repos.items?.length} / {repos.total_count}
              </div>

              <div>
                <button className="btn" onClick={loadMore}>
                  Load more
                </button>
              </div>
            </div>
          )}
          {repos.total_count === 0 && <div>Not found</div>}
        </div>
      </div>
    </div>
  );
}

export default App;
