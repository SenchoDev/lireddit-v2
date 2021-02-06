import { withUrqlClient } from "next-urql"
import { NavBar } from "../components/NavBar";
import { usePostQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () =>{
  const [{ data }] = usePostQuery();
  return  (
    <>
      <NavBar/>
      <div>Hello World</div>
      {!data ? (<div>loading...</div>) : data.posts.map((p) => <div key={p.i}>{p.title}</div>)}
    </>
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
