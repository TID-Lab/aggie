import {Pagination, Placeholder, Stack} from "react-bootstrap";
import React from "react";
import {useSearchParams} from "react-router-dom";
const commaNumber = require('comma-number')

interface IProps {
  goToPage: (pageNum: number) => void,
  total: number,
  itemsPerPage: number,
  size?: "sm" | "lg",
  variant?: "modal" | "page",
  page?: number | null
}

const AggiePagination = (props: IProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  if (props.variant === "modal") {
    const pageNum = props.page || 0;
    return (
        <Stack direction={"horizontal"} gap={2} className={"justify-content-end"}>
          {(props.itemsPerPage > props.total) &&
              <small className={"me-2"}>
                {commaNumber(pageNum * props.itemsPerPage + 1)} - {commaNumber(props.total)}
                {" "} of {commaNumber(props.total)}
              </small>
          }
          {(props.total > props.itemsPerPage) &&
              <small className={"me-2"}>
                {commaNumber(pageNum * props.itemsPerPage + 1)} - {commaNumber(pageNum * props.itemsPerPage + props.itemsPerPage + 1)}
                {" "} of {commaNumber(props.total)}
              </small>
          }
          <Pagination className={"mb-0"} size={props.size ? props.size : undefined}>
            {pageNum === 0 &&
                <>
                  <Pagination.First disabled/>
                  <Pagination.Prev disabled aria-disabled="true"/>
                </>
            }
            {pageNum > 0 &&
                <>
                  <Pagination.First onClick={()=>props.goToPage(0)}/>
                  <Pagination.Prev onClick={()=>props.goToPage( pageNum - 1)}/>
                  <Pagination.Item onClick={()=>props.goToPage( pageNum - 1)}>
                    {pageNum - 1}
                  </Pagination.Item>
                </>
            }
            <Pagination.Item disabled aria-disabled="true">{pageNum}</Pagination.Item>
            {pageNum + 1 < (props.total/props.itemsPerPage) &&
                <>
                  <Pagination.Item onClick={()=>props.goToPage(pageNum + 1)}>
                    {pageNum + 1}
                  </Pagination.Item>
                  <Pagination.Next onClick={()=>props.goToPage(pageNum + 1)}/>
                  <Pagination.Last onClick={()=>props.goToPage(Math.ceil(props.total/props.itemsPerPage - 1))}/>
                </>
            }
            {pageNum >= (props.total/props.itemsPerPage) &&
                <>
                  <Pagination.Next disabled/>
                  <Pagination.Last disabled/>
                </>
            }
          </Pagination>
        </Stack>
    )
  } else {
    if (props.total === 0) {
      return (
          <></>
      )
    } else {
      return (
          <Stack direction={"horizontal"} gap={2} className={"justify-content-end"}>
            {(props.itemsPerPage > props.total) &&
                <small className={"me-2"}>
                  {commaNumber(Number(searchParams.get('page')) * props.itemsPerPage + 1)} - {commaNumber(props.total)}
                  {" "} of {commaNumber(props.total)}
                </small>
            }
            {(props.total > props.itemsPerPage) &&
                <small className={"me-2"}>
                  {commaNumber(Number(searchParams.get('page')) * props.itemsPerPage + 1)} - {commaNumber(Number(searchParams.get('page')) * props.itemsPerPage + props.itemsPerPage + 1)}
                  {" "} of {commaNumber(props.total)}
                </small>
            }
            <Pagination className={"mb-0"} size={props.size ? props.size : undefined}>
              {Number(searchParams.get('page')) === 0 &&
                  <>
                    <Pagination.First disabled/>
                    <Pagination.Prev disabled aria-disabled="true"/>
                  </>
              }
              {Number(searchParams.get('page')) > 0 &&
                  <>
                    <Pagination.First onClick={()=>props.goToPage(0)}/>
                    <Pagination.Prev onClick={()=>props.goToPage(Number(searchParams.get('page')) - 1)}/>
                    <Pagination.Item onClick={()=>props.goToPage(Number(searchParams.get('page')) - 1)}>
                      {Number(searchParams.get('page')) - 1}
                    </Pagination.Item>
                  </>
              }
              <Pagination.Item disabled aria-disabled="true">{Number(searchParams.get('page'))}</Pagination.Item>
              {Number(searchParams.get('page')) + 1 < (props.total/props.itemsPerPage) &&
                  <>
                    <Pagination.Item onClick={()=>props.goToPage(Number(searchParams.get('page')) + 1)}>
                      {Number(searchParams.get('page')) + 1}
                    </Pagination.Item>
                    <Pagination.Next onClick={()=>props.goToPage(Number(searchParams.get('page')) + 1)}/>
                    <Pagination.Last onClick={()=>props.goToPage(Math.ceil(props.total/props.itemsPerPage - 1))}/>
                  </>
              }
              {Number(searchParams.get('page')) + 1 >= (props.total/props.itemsPerPage) &&
                  <>
                    <Pagination.Next disabled/>
                    <Pagination.Last disabled/>
                  </>
              }
            </Pagination>
          </Stack>
      )
    }
  }
}

interface LoadingPaginationIProps {
  size?: "sm" | "lg",
}

export const LoadingPagination = (props: LoadingPaginationIProps) => {
  return(
      <Stack direction={"horizontal"} gap={2} className={"justify-content-end"}>
        <Pagination className={"mb-0"} size={props.size ? props.size : undefined}>
          <Pagination.First disabled/>
          <Pagination.Prev disabled/>
          <Pagination.Next disabled/>
          <Pagination.Last disabled/>
        </Pagination>
      </Stack>
      );
}

export default AggiePagination;