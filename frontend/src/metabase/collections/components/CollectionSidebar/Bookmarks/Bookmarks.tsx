import React, { useState } from "react";
import { t } from "ttag";

import "./sortable.css";

import { PLUGIN_COLLECTIONS } from "metabase/plugins";
import * as Urls from "metabase/lib/urls";
import { color } from "metabase/lib/colors";

import Tooltip from "metabase/components/Tooltip";
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from "metabase/components/sortable";
import Icon from "metabase/components/Icon";
import Link from "metabase/collections/components/CollectionSidebar/CollectionSidebarLink";
import BookmarkEntity from "metabase/entities/bookmarks";
import { LabelContainer } from "../Collections/CollectionsList/CollectionsList.styled";
import BookmarksRoot, {
  BookmarkContainer,
  BookmarkDragIcon,
  BookmarkListRoot,
  BookmarkTypeIcon,
} from "./Bookmarks.styled";

import {
  SidebarHeading,
  ToggleListDisplayButton,
} from "metabase/collections/components/CollectionSidebar/CollectionSidebar.styled";

import { Bookmark, BookmarkableEntities, Bookmarks } from "metabase-types/api";

interface BookmarkProps {
  bookmark: Bookmark;
}

interface CollectionSidebarBookmarksProps {
  bookmarks: Bookmarks;
  deleteBookmark: (id: string, type: string) => void;
}

interface IconProps {
  name: string;
  tooltip?: string;
  isOfficial?: boolean;
}

const BookmarkIcon = ({ bookmark }: BookmarkProps) => {
  const icon = BookmarkEntity.objectSelectors.getIcon(bookmark);
  const isCollection = bookmark.type === "collection";
  const isRegularCollection =
    isCollection && PLUGIN_COLLECTIONS.isRegularCollection(bookmark);
  const isOfficial = isCollection && !isRegularCollection;

  const iconColor = isOfficial ? color("warning") : color("brand");

  return <BookmarkTypeIcon {...icon} color={iconColor} />;
};

const Label = ({ bookmark }: BookmarkProps) => {
  const icon = BookmarkEntity.objectSelectors.getIcon(bookmark);

  return (
    <LabelContainer>
      <BookmarkIcon bookmark={bookmark} />
      {bookmark.name}
    </LabelContainer>
  );
};

const ListOfBookmarks = ({ children }: { children: JSX.Element }) => (
  <BookmarkListRoot>{children}</BookmarkListRoot>
);

type BookmarkItemProps = {
  bookmark: Bookmark;
  handleDeleteBookmark: (arg0: Bookmark) => void;
  isSorting: boolean;
};

const BookmarkItem = ({
  bookmark,
  handleDeleteBookmark,
  isSorting,
}: BookmarkItemProps) => {
  const { id, name, type } = bookmark;
  const url = Urls.bookmark({ id, name, type });

  return (
    <BookmarkContainer isSorting={isSorting}>
      <BookmarkDragIcon name="grabber2" size={12} />
      <Link to={url}>
        <Label bookmark={bookmark} />
      </Link>

      <button onClick={() => handleDeleteBookmark(bookmark)}>
        <Tooltip tooltip={t`Remove bookmark`} placement="bottom">
          <Icon name="bookmark" />
        </Tooltip>
      </button>
    </BookmarkContainer>
  );
};

const SortableBookmarkItem = SortableElement(BookmarkItem);
const SortableListOfBookmark = SortableContainer(ListOfBookmarks);

const CollectionSidebarBookmarks = ({
  bookmarks,
  deleteBookmark,
}: CollectionSidebarBookmarksProps) => {
  const storedShouldDisplayBookmarks =
    localStorage.getItem("shouldDisplayBookmarks") !== "false";
  const [shouldDisplayBookmarks, setShouldDisplayBookmarks] = useState(
    storedShouldDisplayBookmarks,
  );

  const [orderedBookmarks, setOrderedBookmarks] = useState(bookmarks);
  const [isSorting, setIsSorting] = useState(false);

  if (bookmarks.length === 0) {
    return null;
  }

  const handleDeleteBookmark = ({ item_id: id, type }: Bookmark) => {
    deleteBookmark(id.toString(), type);
  };

  const toggleBookmarkListVisibility = () => {
    const booleanForLocalStorage = (!shouldDisplayBookmarks).toString();
    localStorage.setItem("shouldDisplayBookmarks", booleanForLocalStorage);

    setShouldDisplayBookmarks(!shouldDisplayBookmarks);
  };

  const handleSortStart = () => {
    setIsSorting(true);
  };

  const handleSortEnd = ({
    newIndex,
    oldIndex,
  }: {
    newIndex: number;
    oldIndex: number;
  }) => {
    setIsSorting(false);

    const bookmarksToBeReordered = [...orderedBookmarks];
    const element = orderedBookmarks[oldIndex];

    bookmarksToBeReordered.splice(oldIndex, 1);
    bookmarksToBeReordered.splice(newIndex, 0, element);

    setOrderedBookmarks(bookmarksToBeReordered);
  };

  return (
    <BookmarksRoot>
      <SidebarHeading onClick={toggleBookmarkListVisibility}>
        {t`Bookmarks`}{" "}
        <ToggleListDisplayButton
          name="play"
          shouldDisplayBookmarks={shouldDisplayBookmarks}
          size="8"
        />
      </SidebarHeading>

      {shouldDisplayBookmarks && (
        <SortableListOfBookmark
          onSortStart={handleSortStart}
          onSortEnd={handleSortEnd}
          lockAxis="y"
          helperClass="sorting"
        >
          {orderedBookmarks.map((bookmark, index) => {
            return (
              <SortableBookmarkItem
                index={index}
                key={bookmark.id}
                bookmark={bookmark}
                handleDeleteBookmark={handleDeleteBookmark}
                isSorting={isSorting}
              />
            );
          })}
        </SortableListOfBookmark>
      )}
    </BookmarksRoot>
  );
};

export default CollectionSidebarBookmarks;
