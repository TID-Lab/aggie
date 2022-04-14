import {Pagination, Stack} from "react-bootstrap";
import React from "react";
import {useSearchParams} from "react-router-dom";
const commaNumber = require('comma-number')

interface IProps {
  goToPage: (pageNum: number) => void,
  total: number,
  itemsPerPage: number,
}

const AggiePagination = (props: IProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  if (props.total === 0) {
    return (
        <></>
    )
  } else {
    return (
        <Stack direction={"horizontal"} gap={2} className={"justify-content-end"}>
          <small className={"me-2"}>
            {Number(searchParams.get('page')) != null &&
                <>
                  {commaNumber(Number(searchParams.get('page')) * props.itemsPerPage + 1)} - {commaNumber(Number(searchParams.get('page')) * props.itemsPerPage + props.itemsPerPage + 1)}
                </>
            }
            {" "} of {commaNumber(props.total)}
          </small>
          <Pagination className={"mb-0"}>
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

export default AggiePagination;