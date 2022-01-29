import { useState, useEffect, useReducer } from "react";

interface DataFetchState<T extends any> {
  isLoading: boolean;
  isError: boolean;
  data: T;
}

enum DataFetchActionKind {
  Init = "INIT_FETCH",
  Success = "SUCCESS_FETCH",
  Error = "ERROR_FETCH",
}

interface DataFetchAction<T extends any> {
  type: DataFetchActionKind;
  payload?: T;
}

function dataFetchReducer<T extends any>(
  state: DataFetchState<T>,
  action: DataFetchAction<T>
): DataFetchState<T> {
  switch (action.type) {
    case DataFetchActionKind.Init:
      return {
        ...state,
        isLoading: true,
      };
    case DataFetchActionKind.Success:
      return {
        ...state,
        isLoading: false,
        data: action.payload!,
      };
    case DataFetchActionKind.Error:
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error("Wrong DataFetchAction type.");
  }
}

export default function useDataFetchApi<T extends any>(
  initialURL: string,
  initialData: T
): [DataFetchState<T>, React.Dispatch<React.SetStateAction<string>>] {
  const [url, setUrl] = useState(initialURL);

  const [state, dispatch] = useReducer<
    React.Reducer<DataFetchState<T>, DataFetchAction<T>>
  >(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    let didCancel = false;

    const fetchData = async () => {
      dispatch({ type: DataFetchActionKind.Init });
      try {
        const res = await fetch(url);
        const data = (await res.json()) as T;

        if (!didCancel)
          dispatch({ type: DataFetchActionKind.Success, payload: data });
      } catch (err) {
        if (!didCancel) dispatch({ type: DataFetchActionKind.Error });
      }
    };

    fetchData();

    return () => {
      didCancel = true;
    };
  }, [url]);

  return [state, setUrl];
}
