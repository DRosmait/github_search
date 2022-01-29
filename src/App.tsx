import React, { ChangeEventHandler, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import useDataFetchApi from "./hooks/useDataFetchApi";

import "./App.css";

interface GithubResponse {
  items: any[];
  total_count: number;
}

function App() {
  const step = 5;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 200);
  const [repos, setRepos] = useState({} as GithubResponse);

  const [{ isLoading, data }, doRequest] = useDataFetchApi(
    "",
    {} as GithubResponse
  );

  // after search changed
  useEffect(() => {
    setPage(1); // reset page counter
    setRepos({} as GithubResponse); // remove previous loaded repos
  }, [setPage, debouncedSearch, doRequest]);

  // after page changed
  useEffect(() => {
    // if search value is empty, do nothing
    if (!debouncedSearch) return;

    doRequest(
      `https://api.github.com/search/repositories?q=${debouncedSearch}&per_page=${step}&page=${page}`
    );
  }, [page, debouncedSearch, doRequest]);

  // on data from useDataFetchApi changed
  useEffect(() => {
    if (!data.items) return;

    setRepos((value) => ({
      ...data,
      items: [...(value.items || []), ...data.items],
    }));
  }, [data, setRepos]);

  const onChange: ChangeEventHandler = ({ target }) => {
    setSearch((target as HTMLInputElement).value);
  };

  const onLoadMore = () => {
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

              <div className="card-control">
                <div className="count">
                  {repos.items?.length} / {repos.total_count}
                </div>

                <div>
                  <button className="btn" onClick={onLoadMore}>
                    Load more
                  </button>
                </div>

                {isLoading && <div>Loading...</div>}
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
