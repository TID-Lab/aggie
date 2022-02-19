import React from 'react';
import {Alert, Col, Container, Pagination, Row} from "react-bootstrap";
import {useLocation} from "react-router-dom";

interface IProps {
  total: number,
  currentPage: number,
  variant: "groups" | "reports",
  itemsPerPage: number,
}

function useQueryParse() {
  return new URLSearchParams(useLocation().search);
}

const AggiePagination = (props: IProps) => {
  /* TODO: This is a bad practice of using global state (URL) in a subcomponent. I did it like this because it
  * doesn't really make much sense to give all query data to the pagination component. Instead of generating the full
  * search url on its own, pagination just takes the current url and changes the page portion of it.
  */
  let query = useQueryParse();
  const totalPages = Math.ceil(props.total / props.itemsPerPage);
  const goToPage = (pageNum: number) => {
    query.set('page', String(pageNum));
    //if (props.variant === "reports") history.push('/reports?' + query.toString());
    //if (props.variant === "groups") history.push('/groups?' + query.toString());
  }
  if (props.total === 0 || props.itemsPerPage === 0) {return <></>}
  else {
    return (
        <Pagination>
          {props.currentPage === 0 &&
          <>
            <Pagination.First disabled/>
            <Pagination.Prev disabled aria-disabled="true"/>
          </>
          }
          {props.currentPage > 0 &&
          <>
            <Pagination.First onClick={()=>goToPage(0)}/>
            <Pagination.Prev onClick={()=>goToPage(props.currentPage - 1)}/>
            <Pagination.Item onClick={()=>goToPage(props.currentPage - 1)}>
              {props.currentPage - 1}
            </Pagination.Item>
          </>
          }
          <Pagination.Item disabled aria-disabled="true">{props.currentPage}</Pagination.Item>
          {props.currentPage + 1 < totalPages &&
          <>
            <Pagination.Item onClick={()=>goToPage(props.currentPage + 1)}>
              {props.currentPage + 1}
            </Pagination.Item>
            <Pagination.Next onClick={()=>goToPage(props.currentPage + 1)}/>
            <Pagination.Last onClick={()=>goToPage(totalPages - 1)}/>
          </>
          }
          {props.currentPage + 1 >= totalPages &&
          <>
            <Pagination.Next disabled/>
            <Pagination.Last disabled/>
          </>
          }
        </Pagination>
    )
  }
}

export default AggiePagination;


