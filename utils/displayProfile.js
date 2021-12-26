const Table = require("cli-table3");
const { cyan, dim } = require("chalk");

const displayProfile = (profile) => {
  const table = new Table({
    colWidths: [30, 20, 20], //set the widths of each column
  });

  table.push([
    `${cyan(profile.name ? profile.name : profile.username)} ${dim(
      profile.location && `(${profile.location})`
    )}`,
    `Collection: ${profile.collectionNum}`,
    `Wishlist: ${profile.wishlistNum ? profile.wishlistNum : "0"}`,
  ]);
  console.log(table.toString());
};

module.exports = displayProfile;
