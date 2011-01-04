<?php
$label = 'Available Channels';
if (isset($context->label) && !empty($context->label)) {
    UNL_MediaYak_Controller::setReplacementData('title', 'UNL | MediaHub | '.$context->label);
    UNL_MediaYak_Controller::setReplacementData('breadcrumbs', '<ul> <li><a href="http://www.unl.edu/">UNL</a></li> <li><a href="'.UNL_MediaYak_Controller::getURL().'">MediaHub</a></li> <li>'.$context->label.'</li></ul>');
    $label = $context->label;
}
?>
<div id="feedlist">
    <h1><?php echo $label; ?></h1>
    <p>Select a channel to view.</p>
    <div class="clear"></div>
    <?php
    if (count($context->items)) {
        $pager_layout = new UNL_MediaYak_List_PagerLayout($context->pager,
            new Doctrine_Pager_Range_Sliding(array('chunk'=>5)),
                    UNL_MediaYak_Controller::getURL($context, array_merge($context->options, array('page'=>'{%page_number}'))));
        $pager_links = $pager_layout->display(null, true);
        echo '<ul>';
        foreach ($context->items as $feed) {
            echo '<li>
            <a href="'.htmlentities(UNL_MediaYak_Controller::getURL($feed), ENT_QUOTES).'"><img src="'.htmlentities(UNL_MediaYak_Controller::getURL($feed), ENT_QUOTES).'/image" alt="'.htmlentities($feed->title).' image" /></a>
            <div class="aboutFeed">
            <h3><a href="'.htmlentities(UNL_MediaYak_Controller::getURL($feed), ENT_QUOTES).'">'.htmlentities($feed->title).'</a> </h3>
            '.$savvy->render($feed, 'Feed/Creator.tpl.php').'
            <p>'.htmlentities($feed->description).'</p>';
            //@TODO add a check if user is logged in and if has permissions to this feed to edit. If true, add edit/delete links here.
            echo '</div>
            <div class="mediaSamples">
            	<h6>'.count($feed->UNL_MediaYak_Feed_Media).' items</h6>
                <h5 class="subhead">Latest Media <a href="'.UNL_MediaYak_Controller::getURL($feed, array('format'=>'xml')).'" class="feed-icon"> .</a></h5>
                <ul>
                    <li>
                       <a href="#"><img src="http://itunes.unl.edu/thumbnails.php?url=http%3A%2F%2Fwdn.unl.edu%2Ftraining%2Fvideos%2F20100401_MyRedAlerts.mov" alt="Title" />
                       Vipers in the Grass - A Student Production</a>
                    </li>
                    <li>
                       <img src="http://itunes.unl.edu/thumbnails.php?url=http%3A%2F%2Fwww.unl.edu%2Ffinearts%2Fnews%2F2010%2Fvipers%2Fvipers.mp4" alt="Title" />
                       Vipers in the Grass - A Student Production
                    </li>
                </ul>
            </div>
            <div class="clear"></div>
            </li>';
        }
        echo '</ul>';
        ?>
        
        </div>
        <em>Displaying <?php echo $context->first; ?> through <?php echo $context->last; ?> out of <?php echo $context->total; ?></em>
        <?php echo $pager_links; ?>
<?php 
    } else {
        echo '
        <p>
            Sorry, I could not find any channels.
        </p>';
    }
    ?>
